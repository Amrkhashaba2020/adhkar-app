import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";

const router: IRouter = Router();

const MAX_TEXT_LENGTH = 2000;
const UPSTREAM_TIMEOUT_MS = 15_000;
const CACHE_MAX_BYTES = 50 * 1024 * 1024;
const TOKEN_TTL_MS = 90_000;
const TOKEN_MAX_FUTURE_MS = 120_000;

const memCache = new Map<string, Buffer>();
let memCacheBytes = 0;

// Signing secret is generated at process startup and kept in memory only.
// It is never written to disk or committed to version control.
// Tokens from previous server instances are automatically invalidated on restart.
const TTS_TOKEN_SECRET = randomBytes(32).toString("base64url");

// Arabic Unicode block: U+0600–U+06FF, plus common punctuation and diacritics.
// This prevents the endpoint from being used as a generic non-Arabic TTS relay.
const ARABIC_RE = /[\u0600-\u06FF]/;
function isArabicText(text: string): boolean {
  return ARABIC_RE.test(text);
}

const tokenRateLimit = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many token requests — please try again later" },
});

const ttsRateLimit = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many TTS requests — please try again later" },
});

function signToken(expiresAt: number): string {
  return createHmac("sha256", TTS_TOKEN_SECRET)
    .update(String(expiresAt))
    .digest("hex");
}

function verifyToken(token: string, expiresAt: number): boolean {
  const expected = signToken(expiresAt);
  try {
    return timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

async function googleTTS(text: string): Promise<Buffer> {
  const chunk = text.slice(0, 180);
  const url =
    `https://translate.google.com/translate_tts` +
    `?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=ar&client=tw-ob&ttsspeed=0.82`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": "https://translate.google.com/",
      },
      signal: controller.signal,
    });
    if (!resp.ok) throw new Error(`Google TTS ${resp.status}`);
    return Buffer.from(await resp.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}

function evictCache(incoming: number): void {
  const iter = memCache.entries();
  while (memCacheBytes + incoming > CACHE_MAX_BYTES) {
    const { value, done } = iter.next();
    if (done || !value) break;
    const [key, buf] = value;
    memCache.delete(key);
    memCacheBytes -= buf.length;
  }
}

router.get("/tts/token", tokenRateLimit, (req, res) => {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const token = signToken(expiresAt);
  res.json({ token, expiresAt });
});

router.get("/tts", ttsRateLimit, async (req, res) => {
  try {
    const tokenParam = typeof req.query["token"] === "string" ? req.query["token"] : "";
    const expiresAtParam = typeof req.query["expiresAt"] === "string" ? req.query["expiresAt"] : "";
    const expiresAt = Number(expiresAtParam);

    if (
      !tokenParam ||
      !expiresAtParam ||
      !Number.isFinite(expiresAt) ||
      Date.now() >= expiresAt ||
      expiresAt - Date.now() > TOKEN_MAX_FUTURE_MS ||
      !verifyToken(tokenParam, expiresAt)
    ) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const raw = typeof req.query["text"] === "string" ? req.query["text"].trim() : "";
    if (!raw) { res.status(400).json({ error: "text is required" }); return; }

    if (raw.length > MAX_TEXT_LENGTH) {
      res.status(400).json({ error: `text must not exceed ${MAX_TEXT_LENGTH} characters` });
      return;
    }

    if (!isArabicText(raw)) {
      res.status(400).json({ error: "text must contain Arabic content" });
      return;
    }

    const text = raw;

    if (memCache.has(text)) {
      const cached = memCache.get(text)!;
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", cached.length);
      res.setHeader("Cache-Control", "public, max-age=604800");
      res.send(cached);
      return;
    }

    const audio = await googleTTS(text);

    evictCache(audio.length);
    memCache.set(text, audio);
    memCacheBytes += audio.length;

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audio.length);
    res.setHeader("Cache-Control", "public, max-age=604800");
    res.send(audio);
  } catch (err) {
    req.log?.error({ err }, "TTS error");
    res.status(500).json({ error: "TTS failed" });
  }
});

export default router;
