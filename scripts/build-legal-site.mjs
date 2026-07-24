import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "web", "legal");
const pages = [
  ["privacidad", "Política de Privacidad", "docs/legal/PRIVACY-POLICY.md"],
  ["terminos", "Términos de Uso", "docs/legal/TERMS-OF-USE.md"],
  ["comunidad", "Normas de Comunidad", "docs/legal/COMMUNITY-GUIDELINES.md"],
  ["seguridad-infantil", "Seguridad Infantil", "docs/legal/CHILD-SAFETY-STANDARDS.md"],
  ["eliminar-cuenta", "Eliminar Cuenta", "docs/legal/ACCOUNT-DELETION.md"],
  ["soporte", "Soporte", "docs/legal/SUPPORT.md"],
];

await rm(output, { force: true, recursive: true });
await mkdir(output, { recursive: true });
await mkdir(path.join(output, "fonts"), { recursive: true });
await copyFile(path.join(root, "assets", "icon.png"), path.join(output, "brand-mark.png"));
await copyFile(
  path.join(root, "node_modules", "@expo-google-fonts", "lexend-deca", "400Regular", "LexendDeca_400Regular.ttf"),
  path.join(output, "fonts", "LexendDeca-Regular.ttf"),
);
await copyFile(
  path.join(root, "node_modules", "@expo-google-fonts", "lexend-deca", "700Bold", "LexendDeca_700Bold.ttf"),
  path.join(output, "fonts", "LexendDeca-Bold.ttf"),
);
await copyFile(
  path.join(root, "node_modules", "@expo-google-fonts", "inter", "400Regular", "Inter_400Regular.ttf"),
  path.join(output, "fonts", "Inter-Regular.ttf"),
);

const links = pages.map(([slug, title]) => `<a href="/${slug}">${escapeHtml(title)}</a>`).join("");
const cards = pages.map(([slug, title]) => `<a class="card" href="/${slug}"><span>${escapeHtml(title)}</span><b aria-hidden="true">→</b></a>`).join("");

await writeFile(path.join(output, "index.html"), documentHtml(
  "Centro legal y de confianza",
  `<p class="lede">Información clara sobre privacidad, seguridad, Comunidad y tus decisiones dentro de Clean4Jesus.</p><div class="cards">${cards}</div>`,
  links,
), "utf8");

for (const [slug, title, source] of pages) {
  const markdown = await readFile(path.join(root, source), "utf8");
  const dir = path.join(output, slug);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), documentHtml(title, markdownToHtml(markdown), links), "utf8");
}

await writeFile(path.join(output, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: https://legal.clean4jesus.com/sitemap.xml\n", "utf8");
await writeFile(path.join(output, "sitemap.xml"), sitemap(), "utf8");
await writeFile(path.join(output, "_headers"), "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: default-src 'self'; style-src 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'\n", "utf8");
await applyBranding();

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const html = [];
  let listOpen = false;
  let tableOpen = false;
  let tableHeader = false;

  const closeStructures = () => {
    if (listOpen) html.push("</ul>");
    if (tableOpen) html.push(tableHeader ? "</tbody></table>" : "</table>");
    listOpen = false;
    tableOpen = false;
    tableHeader = false;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      if (listOpen) {
        html.push("</ul>");
        listOpen = false;
      }
      continue;
    }
    if (/^\|(?:\s*:?-+:?\s*\|)+$/.test(line)) {
      if (tableOpen && !tableHeader) {
        html.push("</thead><tbody>");
        tableHeader = true;
      }
      continue;
    }
    if (line.startsWith("|") && line.endsWith("|")) {
      if (!tableOpen) {
        closeStructures();
        html.push("<table><thead>");
        tableOpen = true;
      }
      const tag = tableHeader ? "td" : "th";
      const cells = line.slice(1, -1).split("|").map((cell) => `<${tag}>${inline(cell.trim())}</${tag}>`).join("");
      html.push(`<tr>${cells}</tr>`);
      continue;
    }
    if (tableOpen) {
      html.push("</tbody></table>");
      tableOpen = false;
      tableHeader = false;
    }
    if (line.startsWith("# ")) {
      html.push(`<h1>${inline(line.slice(2))}</h1>`);
    } else if (line.startsWith("## ")) {
      html.push(`<h2>${inline(line.slice(3))}</h2>`);
    } else if (line.startsWith("### ")) {
      html.push(`<h3>${inline(line.slice(4))}</h3>`);
    } else if (line.startsWith("- ")) {
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${inline(line.slice(2))}</li>`);
    } else if (/^\d+\.\s/.test(line)) {
      if (listOpen) {
        html.push("</ul>");
        listOpen = false;
      }
      html.push(`<p>${inline(line)}</p>`);
    } else {
      if (listOpen) {
        html.push("</ul>");
        listOpen = false;
      }
      html.push(`<p>${inline(line)}</p>`);
    }
  }
  closeStructures();
  return html.join("");
}

function inline(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

async function applyBranding() {
  const htmlFiles = ["index.html", ...pages.map(([slug]) => path.join(slug, "index.html"))];
  const styles = `<style>
@font-face{font-family:Lexend;src:url('/fonts/LexendDeca-Regular.ttf') format('truetype');font-weight:400;font-display:swap}
@font-face{font-family:Lexend;src:url('/fonts/LexendDeca-Bold.ttf') format('truetype');font-weight:700;font-display:swap}
@font-face{font-family:Inter;src:url('/fonts/Inter-Regular.ttf') format('truetype');font-weight:400;font-display:swap}
:root{color-scheme:light;--ink:#15201d;--muted:#64726d;--line:#dfe6e2;--navy:#11195b;--paper:#fff;--wash:#f7f9f8;--soft:#eef2ff;--gold:#f4aa24;--lime:#c7f000}
*{box-sizing:border-box}body{margin:0;background:var(--wash);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;line-height:1.7}header{background:rgba(255,255,255,.96);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:2}.bar{align-items:center;display:flex;gap:24px;justify-content:space-between;margin:auto;max-width:1080px;padding:14px 24px}.brand{align-items:center;color:var(--navy);display:flex;gap:10px;font-family:Lexend,Inter,sans-serif;font-size:18px;font-weight:700;text-decoration:none}.brand img{border-radius:10px;height:34px;width:34px}.brand span span{color:#fff;-webkit-text-stroke:1px var(--navy);paint-order:stroke fill}nav{display:flex;flex-wrap:wrap;gap:8px 18px}nav a{color:var(--muted);font-size:13px;text-decoration:none}nav a:hover,nav a:focus-visible{color:var(--navy);outline:2px solid var(--gold);outline-offset:4px}main{background:var(--paper);border:1px solid var(--line);border-radius:18px;box-shadow:0 8px 28px rgba(17,25,91,.06);margin:40px auto;max-width:820px;padding:clamp(28px,6vw,64px)}h1,h2,h3{font-family:Lexend,Inter,sans-serif}h1{color:var(--navy);font-size:clamp(32px,6vw,52px);letter-spacing:0;line-height:1.08;margin:0 0 28px}h2{border-top:1px solid var(--line);color:var(--navy);font-size:23px;letter-spacing:0;margin:38px 0 12px;padding-top:30px}h3{color:var(--navy);font-size:18px;margin-top:28px}p,li{font-size:16px;max-width:68ch}p{margin:0 0 16px}ul{padding-left:22px}strong{font-weight:700}code{background:var(--soft);border-radius:6px;color:var(--navy);padding:2px 5px}table{border-collapse:collapse;display:block;margin:24px 0;overflow-x:auto;width:100%}th,td{border:1px solid var(--line);font-size:14px;padding:10px;text-align:left;vertical-align:top}.lede{color:var(--muted);font-size:20px;max-width:640px}.cards{display:grid;gap:12px;margin-top:32px}.card{align-items:center;background:var(--paper);border:1px solid var(--line);border-left:4px solid var(--gold);border-radius:12px;color:var(--ink);display:flex;font-family:Lexend,Inter,sans-serif;font-size:17px;font-weight:700;justify-content:space-between;padding:18px;text-decoration:none}.card:hover,.card:focus-visible{border-color:var(--navy);outline:2px solid var(--gold);outline-offset:3px}.card:focus-visible{transform:translateY(-1px)}footer{background:var(--navy);color:#fff;font-size:13px;margin:48px 0 0;padding:32px max(24px,calc((100% - 1032px)/2))}footer a{color:#fff}@media(max-width:720px){.bar{align-items:center;flex-direction:row;gap:12px;padding:12px 16px}.brand{font-size:16px}nav{display:none}main{border-left:0;border-radius:0;border-right:0;margin:20px 0;padding:28px 22px}h1{font-size:34px}.lede{font-size:17px}p,li{font-size:15px}}
</style>`;
  for (const file of htmlFiles) {
    const filePath = path.join(output, file);
    const html = await readFile(filePath, "utf8");
    const branded = html
      .replace(/<style>[\s\S]*?<\/style>/, styles)
      .replace('<a class="brand" href="/">Clean<span>4</span>Jesus</a>', '<a class="brand" href="/"><img src="/brand-mark.png" alt="" width="34" height="34"><span>Clean<span>4</span>Jesus</span></a>')
      .replace(/<footer>[\s\S]*?<\/footer>/, "<footer>&copy; 2026 Clean4Jesus &middot; soporte@clean4jesus.com</footer>");
    await writeFile(filePath, branded, "utf8");
  }
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function documentHtml(title, content, links) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#ffffff">
  <meta name="description" content="${escapeHtml(title)} de Clean4Jesus">
  <title>${escapeHtml(title)} | Clean4Jesus</title>
  <style>
    :root{color-scheme:light;--ink:#101a17;--muted:#63716c;--line:#dce3df;--blue:#11195b;--paper:#fff;--wash:#f6f8f7;--gold:#f4aa24}*{box-sizing:border-box}body{margin:0;background:var(--wash);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.65}header{background:var(--paper);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:2}.bar{align-items:center;display:flex;gap:24px;justify-content:space-between;margin:auto;max-width:1080px;padding:16px 24px}.brand{color:var(--blue);font-size:18px;font-weight:800;text-decoration:none}.brand span{color:var(--gold)}nav{display:flex;flex-wrap:wrap;gap:8px 18px}nav a{color:var(--muted);font-size:13px;text-decoration:none}main{background:var(--paper);border:1px solid var(--line);border-radius:8px;margin:40px auto;max-width:820px;padding:clamp(26px,6vw,64px)}h1{font-size:clamp(32px,6vw,52px);letter-spacing:0;line-height:1.05;margin:0 0 28px}h2{border-top:1px solid var(--line);font-size:23px;letter-spacing:0;margin:38px 0 12px;padding-top:30px}h3{font-size:18px;margin-top:28px}p,li{font-size:16px}p{margin:0 0 16px}ul{padding-left:22px}strong{font-weight:750}code{background:#eef1f5;border-radius:4px;padding:2px 5px}table{border-collapse:collapse;display:block;margin:24px 0;overflow-x:auto;width:100%}th,td{border:1px solid var(--line);font-size:14px;padding:10px;text-align:left;vertical-align:top}.lede{color:var(--muted);font-size:20px;max-width:640px}.cards{display:grid;gap:12px;margin-top:32px}.card{align-items:center;border:1px solid var(--line);border-left:4px solid var(--gold);color:var(--ink);display:flex;font-size:17px;font-weight:700;justify-content:space-between;padding:18px;text-decoration:none}.card:hover{border-color:var(--blue)}footer{color:var(--muted);font-size:13px;margin:0 auto 40px;max-width:820px;padding:0 24px}@media(max-width:720px){.bar{align-items:flex-start;flex-direction:column}nav{display:none}main{border-left:0;border-radius:0;border-right:0;margin:20px 0;padding:28px 22px}}
  </style>
</head>
<body>
  <header><div class="bar"><a class="brand" href="/">Clean<span>4</span>Jesus</a><nav aria-label="Legal">${links}</nav></div></header>
  <main>${content}</main>
  <footer>© 2026 Clean4Jesus · Responsable: Emmanuel López, Colombia · soporte@clean4jesus.com</footer>
</body>
</html>`;
}

function sitemap() {
  const urls = ["", ...pages.map(([slug]) => slug)];
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((slug) => `<url><loc>https://legal.clean4jesus.com/${slug}</loc></url>`).join("")}</urlset>`;
}
