/**
 * Print the portfolio volume into the PDF copies the book page hands out.
 *
 * It prints /print/book/en and /print/book/ar, every page of the volume laid
 * flat at the flip-book's own size, so each PDF is the book exactly as the
 * site sets it. It also writes the page count and file size of each copy to
 * src/lib/book-pdf.json for the page to show. The PDFs are snapshots: run this
 * again after changing projects at /admin, then deploy.
 *
 *   node scripts/build-book-pdf.mjs [base]
 *
 *   base   the site to print from (default http://localhost:3000, a running
 *          `npm run dev` or `npm start`)
 *
 * It drives the Microsoft Edge installed on the machine (playwright-core
 * downloads no browser of its own).
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import sharp from "sharp";

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const LOCALES = ["en", "ar"];
const OUT = (lang) => path.join("public", "book", `archi-builder-portfolio-${lang}.pdf`);
const MANIFEST = path.join("src", "lib", "book-pdf.json");

/** One flip-book page in CSS pixels, as .book-print-sheet sets it in globals.css. */
const SHEET_WIDTH = 540;
/** The printed page, in millimetres. */
const PAGE = { width: 240, height: 307.2 };
/** 240 mm is 907 CSS px; each 540px sheet is scaled up to fill it. */
const SCALE = ((PAGE.width / 25.4) * 96) / SHEET_WIDTH;
/** The long edge of each photograph in the PDF, and its JPEG quality. */
const PHOTO = { edge: 1600, quality: 80 };

sharp.cache(false);

const browser = await chromium.launch({ channel: "msedge" });
const manifest = {};
try {
  for (const lang of LOCALES) {
    const page = await browser.newPage({ viewport: { width: SHEET_WIDTH + 48, height: 1000 }, deviceScaleFactor: 3 });

    // The site serves photographs as AVIF or WebP, which a PDF can only hold
    // uncompressed. The printer gets the same photographs as JPEGs instead.
    let photos = 0;
    const kept = [];
    await page.route(/\/_next\/image\?/, async (route) => {
      let response;
      try {
        response = await route.fetch();
        const body = await sharp(Buffer.from(await response.body()))
          .rotate()
          .resize({ width: PHOTO.edge, height: PHOTO.edge, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: PHOTO.quality, mozjpeg: true })
          .toBuffer();
        photos++;
        await route.fulfill({ status: 200, contentType: "image/jpeg", body });
      } catch (error) {
        kept.push(`${response ? response.status() : "no response"} ${route.request().url()}: ${String(error.message).split("\n")[0]}`);
        try {
          if (response) await route.fulfill({ response });
          else await route.continue();
        } catch {
          // The page has already moved on.
        }
      }
    });

    await page.goto(`${BASE}/print/book/${lang}`, { waitUntil: "load", timeout: 120_000 });
    // A dev server's tools badge is fixed to a corner and would print on every page.
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map((img) =>
          img.complete
            ? null
            : new Promise((resolve) => {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
              }),
        ),
      );
    });
    await page.waitForTimeout(800);

    const sheets = await page.locator(".book-print-sheet").count();
    if (sheets === 0) throw new Error(`There are no pages at ${BASE}/print/book/${lang}`);

    const out = OUT(lang);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await page.emulateMedia({ media: "print" });
    await page.pdf({
      path: out,
      width: `${PAGE.width}mm`,
      height: `${PAGE.height}mm`,
      scale: SCALE,
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    const bytes = fs.statSync(out).size;
    const printed = (fs.readFileSync(out, "latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    if (printed && printed !== sheets) throw new Error(`${out} came out with ${printed} pages, but the volume has ${sheets}.`);

    manifest[lang] = { pages: sheets, bytes };
    console.log(`${out}: ${sheets} pages, ${photos} photographs, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
    for (const line of kept) console.log(`  not converted, kept as sent: ${line}`);
    await page.close();
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`printed from ${BASE}; wrote ${MANIFEST}`);
} finally {
  await browser.close();
}
