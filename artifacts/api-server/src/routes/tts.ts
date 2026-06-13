import { Router, type IRouter } from "express";

const router: IRouter = Router();
const memCache = new Map<string, Buffer>();

const AZURE_KEY = process.env["AZURE_SPEECH_KEY"] ?? "";
const AZURE_REGION = process.env["AZURE_SPEECH_REGION"] ?? "uaenorth";
const AZURE_VOICE = "ar-SA-HamedNeural";

function fixArabicPronunciation(text: string): string {
  return text
    // حروف الجر تأتي أولاً — الهاء مجرورة فتأخذ كسرة
    .replace(/بالله/g, "باللَّهِ")
    .replace(/تالله/g, "تَاللَّهِ")
    // والله — الهاء مرفوعة فتأخذ ضمة
    .replace(/والله/g, "واللَّهُ")
    // لفظ الجلالة المجرد — شدة على اللام + ضمة على الهاء
    .replace(/الله/g, "اللَّهُ")
    // لله (حرف الجر لام) — الهاء مجرورة فتأخذ كسرة
    .replace(/لله/g, "لِلَّهِ");
}

async function azureTTS(text: string): Promise<Buffer> {
  const endpoint = `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const processed = fixArabicPronunciation(text);
  const ssml = `<speak version='1.0' xml:lang='ar-SA'>
    <voice name='${AZURE_VOICE}'>
      <prosody rate='-10%'>${processed.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</prosody>
    </voice>
  </speak>`;

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": AZURE_KEY,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3",
      "User-Agent": "adhkar-app",
    },
    body: ssml,
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Azure TTS ${resp.status}: ${body}`);
  }
  return Buffer.from(await resp.arrayBuffer());
}

async function azureTTSChunked(text: string): Promise<Buffer> {
  const maxLen = 2000;
  if (text.length <= maxLen) return azureTTS(text);

  const parts: string[] = [];
  const sep = /[،,؛;.\n]/;
  let rem = text;
  while (rem.length > maxLen) {
    let idx = -1;
    for (let i = maxLen; i >= 100; i--) {
      if (sep.test(rem[i] ?? "")) { idx = i + 1; break; }
    }
    if (idx === -1) idx = maxLen;
    parts.push(rem.slice(0, idx).trim());
    rem = rem.slice(idx).trim();
  }
  if (rem) parts.push(rem);

  const bufs: Buffer[] = [];
  for (const part of parts.filter(Boolean)) {
    bufs.push(await azureTTS(part));
  }
  return Buffer.concat(bufs);
}

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

    let audio: Buffer;

    if (AZURE_KEY) {
      try {
        audio = await azureTTSChunked(text);
      } catch (azureErr) {
        req.log?.warn({ err: azureErr }, "Azure TTS failed, falling back to Google TTS");
        audio = await googleTTS(text);
      }
    } else {
      audio = await googleTTS(text);
    }

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
