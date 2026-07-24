const challengeUrl = "https://verify.clean4jesus.com/turnstile/";
const moderationUrl = "https://moderation.clean4jesus.com/";

const challenge = await fetchText(challengeUrl);
assert(challenge.includes("Verificacion Clean4Jesus"), "La pagina Turnstile no contiene la identidad esperada.");
assert(challenge.includes("challenges.cloudflare.com/turnstile"), "La pagina Turnstile no carga el script oficial.");

const moderation = await fetchText(moderationUrl);
const scriptPaths = [...moderation.matchAll(/<script[^>]+src="([^"]+)"/gu)].map((match) => match[1]);
assert(scriptPaths.length > 0, "La consola publicada no referencia un bundle JavaScript.");

const bundles = await Promise.all(scriptPaths.map((path) => fetchText(new URL(path, moderationUrl).toString())));
const publicSource = bundles.join("\n");
assert(publicSource.includes("moderate-community"), "La consola no contiene el contrato de moderacion esperado.");
// supabase-js includes the literal prefix so it can reject secret keys in browsers.
// Only flag a token-shaped value, not that defensive SDK check.
assert(!/service_role|sb_secret_[A-Za-z0-9_-]{20,}/iu.test(publicSource), "La consola publicada contiene una clave administrativa prohibida.");

console.log("PASS: Turnstile y consola responden por HTTPS sin secretos administrativos en el bundle publico.");

async function fetchText(url) {
  const response = await fetch(url, { redirect: "follow" });
  assert(response.ok, `${url} respondio HTTP ${response.status}.`);
  return response.text();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
