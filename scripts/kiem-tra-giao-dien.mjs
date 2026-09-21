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
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC_FE = process.argv[2] || "http://localhost:3000";
const THU_MUC = path.dirname(fileURLToPath(import.meta.url));

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

/** Khoa dich chua dich: ham t() tra chinh khoa ra man hinh. */
function laKhoaDich(text) {
  return /^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)+$/.test(text.trim());
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

const trinhDuyet = await chromium.launch();

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
  page.on("console", (m) => { if (m.type() === "error") loiJs.push(m.text()); });
  page.on("response", (r) => {
    if (r.status() >= 500) loiJs.push(`HTTP ${r.status()} ${r.url()}`);
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
