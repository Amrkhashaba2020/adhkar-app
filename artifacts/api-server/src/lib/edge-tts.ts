import WebSocket from "ws";
import crypto from "crypto";

const EDGE_TTS_URL =
  "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1" +
  "?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4";

function uuid() {
  return crypto.randomUUID().replace(/-/g, "");
}

function timestamp() {
  return new Date().toISOString();
}

const AUDIO_HEADER_SEP = Buffer.from("Path:audio\r\n\r\n");

export async function edgeTTS(
  text: string,
  voice = "ar-SA-HamedNeural",
  rate = "-10%",
  pitch = "-5Hz"
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(EDGE_TTS_URL, {
      headers: {
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "ar-SA,ar;q=0.9,en;q=0.8",
        "Origin": "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
      },
    });

    const reqId = uuid();
    const audioChunks: Buffer[] = [];
    let timer: ReturnType<typeof setTimeout>;

    const done = (buf?: Buffer, err?: Error) => {
      clearTimeout(timer);
      ws.terminate();
      if (err) reject(err);
      else resolve(buf ?? Buffer.concat(audioChunks));
    };

    timer = setTimeout(() => done(undefined, new Error("Edge TTS timeout")), 30_000);

    ws.on("error", (err) => done(undefined, err));

    ws.on("open", () => {
      ws.send(
        `X-Timestamp:${timestamp()}\r\n` +
          `Content-Type:application/json; charset=utf-8\r\n` +
          `Path:speech.config\r\n\r\n` +
          `{"context":{"synthesis":{"audio":{"metadataoptions":` +
          `{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},` +
          `"outputFormat":"audio-24khz-96kbitrate-mono-mp3"}}}}`
      );

      const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

      const ssml =
        `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='ar-SA'>` +
        `<voice name='${voice}'>` +
        `<prosody rate='${rate}' pitch='${pitch}'>${escaped}</prosody>` +
        `</voice></speak>`;

      ws.send(
        `X-RequestId:${reqId}\r\n` +
          `Content-Type:application/ssml+xml\r\n` +
          `X-Timestamp:${timestamp()}\r\n` +
          `Path:ssml\r\n\r\n` +
          ssml
      );
    });

    ws.on("message", (data: Buffer | string, isBinary: boolean) => {
      if (isBinary) {
        const buf = data as Buffer;
        const idx = buf.indexOf(AUDIO_HEADER_SEP);
        if (idx !== -1) {
          audioChunks.push(buf.slice(idx + AUDIO_HEADER_SEP.length));
        }
      } else {
        const msg = data.toString();
        if (msg.includes("Path:turn.end")) {
          done(Buffer.concat(audioChunks));
        }
      }
    });
  });
}
