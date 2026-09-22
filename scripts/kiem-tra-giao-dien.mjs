/**
 * Quet giao dien bang Chromium that.
 *
 * Vi sao can: unit test cua frontend chay tren jsdom voi du lieu gia, nen
 * khong bat duoc ba loai loi da that su lot luoi:
 *
 *   1. Loi JavaScript luc chay (vi du doc .length cua mot mang undefined)
 *      — jsdom khong dung API that nen khong tai hien.
 *   2. Chuoi tieng Anh con sot giua giao dien tieng Viet — 28 chuoi nhu vay
 *      da ton tai o 6 tep ma khong test nao noi gi.
 *   3. Khoa dich bi thieu: ham t() tra ve CHINH KHOA khi tra tu dien khong
 *      thay, nen man hinh hien "dashboard.title" thay vi chu tieng Viet.
 *      Khong loi, khong canh bao, chi xau.
 *
 * Chay: node scripts/kiem-tra-giao-dien.mjs [goc_frontend]
 * Thoat 0 neu sach, 1 neu co van de. In moi van de ra stdout.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const GOC_FE = process.argv[2] || "http://localhost:3000";
const THU_MUC = path.dirname(fileURLToPath(import.meta.url));

// playwright duoc cai o frontend/node_modules, con tep nay nam o scripts/.
// ESM giai ten goi theo vi tri CUA TEP chu khong theo thu muc lam viec, nen
// `import ... from "playwright"` that bai du da cd sang frontend/. Phai neu
// ro diem xuat phat cua phep giai ten.
const nap = createRequire(path.join(THU_MUC, "..", "frontend", "package.json"));
const { chromium } = nap("playwright");

const MAT_KHAU = "Demo@123456";

/** Trang nao thuoc vai nao. Them trang moi thi them o day. */
const LO_TRINH = [
  { vai: "KHACH", email: null, trang: ["/", "/vote", "/rankings", "/login", "/register"] },
  { vai: "BTC", email: "coordinator@demo.local",
    trang: ["/app", "/coordinator/events", "/coordinator/users", "/coordinator/audit-logs"] },
  { vai: "GK", email: "judge1@demo.local", trang: ["/app", "/judge"] },
  { vai: "MENTOR", email: "mentor1@demo.local", trang: ["/app", "/mentor"] },
  { vai: "TS", email: "leader@demo.local", trang: ["/app", "/team"] },
];

const CHO_PHEP = new Set(
  fs.readFileSync(path.join(THU_MUC, "tu-cho-phep-tieng-anh.txt"), "utf8")
    .split("\n").map((d) => d.trim()).filter((d) => d && !d.startsWith("#"))
    .map((d) => d.toLowerCase()),
);

/** Chu tieng Viet co dau. Mot cau tieng Viet that gan nhu luon co it nhat mot. */
const CO_DAU = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

const vande = [];
const bao = (s) => { vande.push(s); console.log("  \x1b[31m✗\x1b[0m " + s); };
const ok = (s) => console.log("  \x1b[32m✓\x1b[0m " + s);

/**
 * Cau tieng Anh con sot: >= 3 tu, toan ky tu ASCII, khong co dau tieng Viet.
 * Nguong 3 tu de tranh bao nham ten rieng ("Hackathon", "SHMS", "Demo Track").
 */
function nghiTiengAnh(text) {
  const cau = text.trim();
  if (cau.length < 8 || CO_DAU.test(cau)) return false;
  if (CHO_PHEP.has(cau.toLowerCase())) return false;
  const tu = cau.split(/\s+/).filter((t) => /^[A-Za-z][A-Za-z'’-]*$/.test(t));
  return tu.length >= 3 && tu.length === cau.split(/\s+/).length;
}

/**
 * Khoa dich chua dich: ham t() tra chinh khoa ra man hinh.
 *
 * MOI doan ngan cach boi dau cham phai bat dau bang chu cai. Neu khong thi
 * chuoi phien ban kieu "v1.2.3" o chan trang cung bi bao nham la khoa dich.
 */
function laKhoaDich(text) {
  return /^[a-z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+$/.test(text.trim());
}

async function chuChuaDich(page) {
  return page.evaluate(() => {
    const ra = [];
    const di = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = di.nextNode())) {
      const cha = n.parentElement;
      if (!cha) continue;
      const the = cha.tagName;
      if (the === "SCRIPT" || the === "STYLE" || the === "NOSCRIPT") continue;
      if (!cha.offsetParent && the !== "BODY") continue;   // bi an
      const t = n.textContent.trim();
      if (t) ra.push(t);
    }
    return ra;
  });
}

async function dangNhap(page, email) {
  await page.goto(`${GOC_FE}/login`, { waitUntil: "domcontentloaded" });
  await page.fill("#email", email);
  await page.fill("#password", MAT_KHAU);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.endsWith("/login"), { timeout: 20000 }),
    page.click('button[type="submit"]'),
  ]);
}

/**
 * Playwright doi dung ban Chromium khop voi phien ban thu vien cua no. Tren
 * may da co san mot ban khac (vi du anh Docker cai truoc), no bao thieu
 * trinh duyet va bat chay `npx playwright install` — tai lai ca tram MB moi
 * lan. Neu tim thay ban co san thi dung luon; dat DUONG_CHROMIUM de chi ro.
 */
function timChromium() {
  if (process.env.DUONG_CHROMIUM) return process.env.DUONG_CHROMIUM;
  const ungVien = ["/opt/pw-browsers/chromium/chrome-linux/chrome"];
  for (const thu of fs.existsSync("/opt/pw-browsers") ? fs.readdirSync("/opt/pw-browsers") : []) {
    if (thu.startsWith("chromium-")) ungVien.push(`/opt/pw-browsers/${thu}/chrome-linux/chrome`);
  }
  return ungVien.find((d) => fs.existsSync(d)) || null;
}

let trinhDuyet;
try {
  trinhDuyet = await chromium.launch();
} catch (e) {
  const duong = timChromium();
  if (!duong) throw e;
  console.log(`  (dung Chromium co san: ${duong})`);
  trinhDuyet = await chromium.launch({ executablePath: duong });
}

for (const { vai, email, trang } of LO_TRINH) {
  const boi = await trinhDuyet.newContext();
  // Ep tieng Viet: neu khong, lan chay truoc de lai "en" trong localStorage
  // thi moi chuoi tieng Anh deu la hop le va phep quet thanh vo nghia.
  await boi.addInitScript(() => {
    try { window.localStorage.setItem("shms-language", "vi"); } catch { /* rieng tu */ }
  });
  const page = await boi.newPage();

  const loiJs = [];
  page.on("pageerror", (e) => loiJs.push(String(e.message)));

  // Khong nghe kenh console cho "Failed to load resource": Chromium ghi dong
  // do cho MOI phan hoi 4xx/5xx nhung khong kem duong dan, nen doc mot minh
  // thi khong biet cai gi hong. Nghe thang kenh response de co ca ma lan
  // duong dan.
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().startsWith("Failed to load resource")) {
      loiJs.push(m.text());
    }
  });
  page.on("response", (r) => {
    if (r.status() < 400) return;
    // Khach chua dang nhap: AuthContext goi /api/auth/me ngay lan tai dau de
    // biet co phien cu hay khong, va 401 o day la cau tra loi DUNG — ma
    // nguon bat va xu ly tuong minh, khong chuyen huong di dau. Dem no la
    // loi thi moi trang cong khai deu do oan.
    if (vai === "KHACH" && r.status() === 401 && r.url().endsWith("/api/auth/me")) return;
    loiJs.push(`HTTP ${r.status()} ${r.request().method()} ${r.url()}`);
  });

  try {
    if (email) await dangNhap(page, email);
  } catch (e) {
    bao(`${vai}: khong dang nhap duoc qua giao dien — ${e.message.split("\n")[0]}`);
    await boi.close();
    continue;
  }

  for (const duong of trang) {
    loiJs.length = 0;
    await page.goto(`${GOC_FE}${duong}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(700);

    // Trang phai co noi dung that, khong phai vo trang sau loi dung hinh.
    const soChu = (await page.locator("body").innerText()).trim().length;
    if (soChu < 40) bao(`${vai} ${duong}: trang gan nhu rong (${soChu} ky tu)`);

    const chu = await chuChuaDich(page);
    const anh = chu.filter(nghiTiengAnh);
    const khoa = chu.filter(laKhoaDich);

    if (anh.length) bao(`${vai} ${duong}: con chuoi tieng Anh -> ${JSON.stringify(anh.slice(0, 5))}`);
    if (khoa.length) bao(`${vai} ${duong}: khoa dich chua dich -> ${JSON.stringify(khoa.slice(0, 5))}`);
    if (loiJs.length) bao(`${vai} ${duong}: loi trinh duyet -> ${JSON.stringify([...new Set(loiJs)].slice(0, 3))}`);

    if (!anh.length && !khoa.length && !loiJs.length && soChu >= 40) {
      ok(`${vai} ${duong} (${soChu} ky tu, khong loi)`);
    }
  }
  await boi.close();
}

await trinhDuyet.close();
console.log(vande.length ? `\n${vande.length} van de giao dien` : "\nGiao dien sach");
process.exit(vande.length ? 1 : 0);
