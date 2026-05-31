import { Router, type IRouter } from "express";
import OpenAI from "openai";

const router: IRouter = Router();

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

router.post("/tts", async (req, res) => {
  try {
    const { text } = req.body as { text?: string };
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      res.status(400).json({ error: "text is required" });
      return;
    }

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: text.trim(),
      response_format: "mp3",
      speed: 0.85,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(buffer);
  } catch (err) {
    req.log?.error({ err }, "TTS error");
    res.status(500).json({ error: "TTS failed" });
  }
});

export default router;
