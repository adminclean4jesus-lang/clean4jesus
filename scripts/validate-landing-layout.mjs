import { createServer } from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const root = path.join(process.cwd(), "web", "landing");
const artifacts = path.join(process.cwd(), "artifacts", "landing");
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".png": "image/png",
  ".ttf": "font/ttf",
};

const server = createServer(async (request, response) => {
  try {
    const requestedPath = request.url === "/" ? "index.html" : decodeURIComponent(request.url ?? "").replace(/^\/+/, "");
    const filePath = path.join(root, requestedPath);
    const content = await readFile(filePath);
    response.writeHead(200, { "Content-Type": contentTypes[path.extname(filePath)] ?? "application/octet-stream" });
    response.end(content);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

await mkdir(artifacts, { recursive: true });
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
const port = typeof address === "object" && address ? address.port : 0;
const browser = await chromium.launch();

try {
  for (const viewport of [
    { height: 900, name: "desktop", width: 1440 },
    { height: 873, name: "pixel", width: 393 },
  ]) {
    const page = await browser.newPage({ viewport });
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const heroCopy = await page.locator(".hero-copy").innerText();
    if (!heroCopy.includes("libertad frente al contenido para adultos") || !heroCopy.includes("Jesús en el centro")) {
      throw new Error(`${viewport.name}: el primer viewport no explica claramente la función principal`);
    }
    const hiddenReveals = await page.locator(".reveal:visible").evaluateAll(
      (elements) => elements.filter((element) => Number.parseFloat(getComputedStyle(element).opacity) < 0.99).length,
    );
    if (hiddenReveals > 0) {
      throw new Error(`${viewport.name}: ${hiddenReveals} animated sections remained hidden`);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(180);
    await page.screenshot({ fullPage: true, path: path.join(artifacts, `${viewport.name}.png`) });

    const layout = await page.evaluate(() => {
      const phone = document.querySelector(".product-stage:not([style]) .phone, .phone");
      const phoneBox = phone?.getBoundingClientRect();
      return {
        documentWidth: document.documentElement.scrollWidth,
        phoneHeight: phoneBox?.height ?? 0,
        phoneWidth: phoneBox?.width ?? 0,
        viewportWidth: window.innerWidth,
      };
    });

    if (layout.documentWidth > layout.viewportWidth + 1) {
      throw new Error(`${viewport.name}: horizontal overflow ${layout.documentWidth}px > ${layout.viewportWidth}px`);
    }
    const ratio = layout.phoneWidth / layout.phoneHeight;
    if (Math.abs(ratio - 1081 / 1999) > 0.015) {
      throw new Error(`${viewport.name}: invalid phone ratio ${ratio.toFixed(3)}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

console.log("Landing layout: PASS (1440px desktop, 393px Pixel).");
