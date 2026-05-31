import { Router, type IRouter } from "express";

const router: IRouter = Router();

const memCache = new Map<string, Buffer>();

router.get("/tts", async (req, res) => {
  try {
    const text = typeof req.query["text"] === "string" ? req.query["text"].trim() : "";
    if (!text) {
      res.status(400).json({ error: "text is required" });
      return;
    }

    if (memCache.has(text)) {
      const cached = memCache.get(text)!;
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", cached.length);
      res.setHeader("Cache-Control", "public, max-age=604800");
      res.send(cached);
      return;
    }

    const chunks = splitText(text, 180);
    const buffers: Buffer[] = [];

    for (const chunk of chunks) {
      const url =
        `https://translate.google.com/translate_tts` +
        `?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=ar&client=tw-ob&ttsspeed=0.85`;

      const resp = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Referer": "https://translate.google.com/",
          "Accept": "audio/mpeg,audio/*",
        },
      });

      if (!resp.ok) {
        res.status(502).json({ error: `upstream TTS ${resp.status}` });
        return;
      }

      buffers.push(Buffer.from(await resp.arrayBuffer()));
    }

    const combined = Buffer.concat(buffers);

    if (memCache.size > 200) {
      const firstKey = memCache.keys().next().value;
      if (firstKey !== undefined) memCache.delete(firstKey);
    }
    memCache.set(text, combined);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", combined.length);
    res.setHeader("Cache-Control", "public, max-age=604800");
    res.send(combined);
  } catch (err) {
    req.log?.error({ err }, "TTS error");
    res.status(500).json({ error: "TTS failed" });
  }
});

function splitText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const parts: string[] = [];
  const separators = /[،,؛;.\n]/;
  let remaining = text;
  while (remaining.length > maxLen) {
    let idx = -1;
    for (let i = maxLen; i >= 20; i--) {
      if (separators.test(remaining[i] ?? "")) {
        idx = i + 1;
        break;
      }
    }
    if (idx === -1) idx = maxLen;
    parts.push(remaining.slice(0, idx).trim());
    remaining = remaining.slice(idx).trim();
  }
  if (remaining) parts.push(remaining);
  return parts.filter(Boolean);
}

export default router;
