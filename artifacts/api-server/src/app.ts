import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const PRIVACY_HTML = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>سياسة الخصوصية — أذكار الصباح والمساء</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      background: #f9f9f6;
      color: #222;
      line-height: 1.9;
      padding: 24px 16px 60px;
    }
    .container { max-width: 720px; margin: 0 auto; }
    header {
      text-align: center;
      padding: 32px 0 24px;
      border-bottom: 2px solid #2E7D32;
      margin-bottom: 32px;
    }
    header h1 { font-size: 1.8rem; color: #2E7D32; margin-bottom: 6px; }
    header p { color: #666; font-size: 0.95rem; }
    h2 {
      font-size: 1.1rem;
      color: #2E7D32;
      margin: 28px 0 10px;
      padding-right: 12px;
      border-right: 4px solid #2E7D32;
    }
    p, li { font-size: 1rem; color: #333; margin-bottom: 8px; }
    ul { padding-right: 24px; margin-bottom: 12px; }
    li { list-style: disc; }
    .highlight {
      background: #e8f5e9;
      border-right: 4px solid #2E7D32;
      padding: 14px 16px;
      border-radius: 8px;
      margin: 16px 0;
      font-size: 1rem;
      color: #1b5e20;
    }
    footer {
      text-align: center;
      margin-top: 48px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #888;
      font-size: 0.88rem;
    }
  </style>
</head>
<body>
<div class="container">
  <header>
    <h1>📿 سياسة الخصوصية</h1>
    <p>تطبيق أذكار الصباح والمساء</p>
  </header>

  <p>بسم الله الرحمن الرحيم</p>

  <div class="highlight">
    هذا التطبيق مجاني بالكامل، ومحتواه من أذكار وأدعية متاح للجميع للاقتباس والطباعة والاحتفاظ به والنشر، كل ذلك لوجه الله رب العالمين.
  </div>

  <h2>١. نظرة عامة</h2>
  <p>
    تطبيق <strong>أذكار الصباح والمساء</strong> هو تطبيق إسلامي مجاني يهدف إلى مساعدة المسلمين على المداومة على أذكار الصباح والمساء. نحن نحترم خصوصيتك ونلتزم بحماية بياناتك.
  </p>

  <h2>٢. البيانات التي يجمعها التطبيق</h2>
  <p>التطبيق <strong>لا يجمع أي بيانات شخصية</strong> ولا يرسلها إلى أي خادم خارجي. جميع البيانات تُحفظ محلياً على جهازك فقط، وتشمل:</p>
  <ul>
    <li>إعدادات التطبيق (الثيم، حجم الخط، ألوان الخلفية)</li>
    <li>عداد الأذكار وحالة الإنجاز اليومية</li>
    <li>أوقات إشعارات الصباح والمساء</li>
    <li>التسجيلات الصوتية الشخصية (تُحفظ على الجهاز فقط)</li>
    <li>سجل الإنجاز التاريخي</li>
  </ul>

  <h2>٣. الأذونات المستخدمة</h2>
  <ul>
    <li><strong>المايكروفون:</strong> لتسجيل صوتك عند قراءة الأذكار. يُستخدم فقط عند طلبك ذلك صراحةً.</li>
    <li><strong>الإشعارات:</strong> لإرسال تذكير يومي بأذكار الصباح والمساء في الأوقات التي تحددها.</li>
    <li><strong>الإنترنت:</strong> لتشغيل التلاوة الصوتية عبر خدمة النطق الآلي.</li>
  </ul>

  <h2>٤. التلاوة الصوتية</h2>
  <p>
    عند الضغط على زر الاستماع، يُرسَل نص الذكر إلى خادم التطبيق لتوليد الصوت. لا يُحتفظ بهذا النص بعد توليد الصوت، ولا يُشارك مع أي طرف ثالث.
  </p>

  <h2>٥. محتوى التطبيق</h2>
  <div class="highlight">
    جميع محتويات التطبيق من أذكار وأدعية وسور قرآنية مُتاحة بحرية تامة لكل من يريد الاقتباس منها أو طباعتها أو الاحتفاظ بها أو مشاركتها — كل ذلك لوجه الله رب العالمين، بلا قيود ولا حقوق محفوظة على كلام الله وسنة نبيه ﷺ.
  </div>

  <h2>٦. الأطفال</h2>
  <p>
    التطبيق مناسب لجميع الأعمار. لا يجمع التطبيق أي بيانات من الأطفال أو البالغين.
  </p>

  <h2>٧. التغييرات على هذه السياسة</h2>
  <p>
    قد يتم تحديث هذه السياسة من حين لآخر. سيُشار إلى تاريخ آخر تحديث في أسفل الصفحة.
  </p>

  <h2>٨. التواصل</h2>
  <p>لأي استفسار يمكن التواصل عبر صفحة التطبيق على Google Play.</p>

  <footer>
    <p>آخر تحديث: يونيو ٢٠٢٦</p>
    <p>تطبيق أذكار الصباح والمساء — <strong>com.adhkar.morningevening</strong></p>
  </footer>
</div>
</body>
</html>`;

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const allowedOrigins: string[] = (process.env["REPLIT_DOMAINS"] ?? "")
  .split(",")
  .map((d) => d.trim())
  .filter(Boolean)
  .map((d) => `https://${d}`);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    methods: ["GET", "HEAD", "OPTIONS"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/privacy", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(PRIVACY_HTML);
});

app.use("/api", router);

export default app;
