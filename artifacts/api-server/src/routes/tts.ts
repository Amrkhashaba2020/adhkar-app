import { Router, type IRouter } from "express";

const router: IRouter = Router();
const memCache = new Map<string, Buffer>();

async function googleTTS(text: string): Promise<Buffer> {
  const chunk = text.slice(0, 180);
  const url =
    `https://translate.google.com/translate_tts` +
    `?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=ar&client=tw-ob&ttsspeed=0.82`;

  const resp = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Referer": "https://translate.google.com/",
    },
  });
  if (!resp.ok) throw new Error(`Google TTS ${resp.status}`);
  return Buffer.from(await resp.arrayBuffer());
}

async function splitAndFetch(text: string): Promise<Buffer> {
  const maxLen = 180;
  if (text.length <= maxLen) return googleTTS(text);

  const parts: string[] = [];
  const sep = /[،,؛;.\n]/;
  let rem = text;
  while (rem.length > maxLen) {
    let idx = -1;
    for (let i = maxLen; i >= 20; i--) {
      if (sep.test(rem[i] ?? "")) { idx = i + 1; break; }
    }
    if (idx === -1) idx = maxLen;
    parts.push(rem.slice(0, idx).trim());
    rem = rem.slice(idx).trim();
  }
  if (rem) parts.push(rem);

  const bufs = await Promise.all(parts.filter(Boolean).map(googleTTS));
  return Buffer.concat(bufs);
}

router.get("/tts", async (req, res) => {
  try {
    const text = typeof req.query["text"] === "string" ? req.query["text"].trim() : "";
    if (!text) { res.status(400).json({ error: "text is required" }); return; }

    if (memCache.has(text)) {
      const cached = memCache.get(text)!;
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", cached.length);
      res.setHeader("Cache-Control", "public, max-age=604800");
      res.send(cached);
      return;
    }

    const audio = await splitAndFetch(text);

    if (memCache.size > 300) {
      const key = memCache.keys().next().value;
      if (key !== undefined) memCache.delete(key);
    }
    memCache.set(text, audio);

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
