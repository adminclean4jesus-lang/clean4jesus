import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.5";

const tokenPattern = /^[A-Za-z0-9_-]{43}$/;

Deno.serve(async (request) => {
  if (request.method !== "GET") return page("Método no permitido", "Este enlace solo se puede abrir desde el correo.", 405);
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!tokenPattern.test(token)) return page("Enlace no válido", "Pide a la persona que te eligió que envíe una nueva solicitud.", 400);
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("ACCOUNTABILITY_FROM_EMAIL");
  if (!url || !serviceRole || !resendKey || !from) return page("Servicio no disponible", "Inténtalo de nuevo más tarde.", 503);
  const admin = createClient(url, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } });
  const pin = createGuardianPin();
  const { data, error } = await admin.rpc("confirm_guardian_pin_request", {
    p_confirmation_token_hash: `\\x${await sha256Hex(token)}`,
    p_pin_hash: await sha256Hex(pin),
  });
  if (error || !data?.[0]?.guardian_email) return page("Este enlace ya no está disponible", "Puede haber vencido, sido cancelado o ya fue confirmado.", 410);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to: [data[0].guardian_email], subject: "Tu PIN de protección de Clean4Jesus",
        text: `Gracias por aceptar acompañar esta decisión. Tu PIN de protección es: ${pin}. Guárdalo en un lugar seguro y no lo reenvíes. La persona no verá este PIN en su teléfono.`,
        html: pinEmail(pin),
      }),
    });
    if (!response.ok) {
      await resetConfirmation(admin, token);
      return page("No pudimos entregar el PIN", "No se activó ninguna protección. Intenta abrir el enlace de nuevo más tarde.", 502);
    }
  } catch {
    await resetConfirmation(admin, token);
    return page("No pudimos entregar el PIN", "No se activó ninguna protección. Intenta abrir el enlace de nuevo más tarde.", 502);
  }
  return page("Acompañamiento confirmado", "Te enviamos el PIN de protección a este correo. Guárdalo; la persona que te eligió no lo verá en su teléfono.", 200);
});

function createGuardianPin() {
  const values = crypto.getRandomValues(new Uint32Array(8));
  return [...values].map((value) => String(value % 10)).join("");
}

async function sha256Hex(value: string) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function page(title: string, body: string, status: number) {
  return new Response(`<!doctype html><html lang="es"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · Clean4Jesus</title><body style="margin:0;background:#f4f6fa;font-family:Arial,sans-serif;color:#102a63"><main style="max-width:520px;margin:10vh auto;padding:18px"><section style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 12px 32px #102a631a"><header style="background:#0d2860;padding:30px;text-align:center"><img src="https://clean4jesus.com/icon.png" width="56" height="56" alt="Clean4Jesus"/><h1 style="color:#fff;font-size:25px;margin:16px 0 0">Clean4Jesus</h1></header><div style="padding:32px"><h2 style="margin-top:0">${title}</h2><p style="font-size:16px;line-height:1.6">${body}</p><p style="font-size:14px;color:#52627e">Que Cristo guíe cada decisión.</p></div></section></main></body></html>`, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

function pinEmail(pin: string) {
  return `<div style="background:#f4f6fa;padding:28px 12px;font-family:Arial,sans-serif;color:#102a63"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center"><table role="presentation" width="600" style="max-width:600px;background:#fff;border-radius:24px;overflow:hidden"><tr><td style="background:#0d2860;padding:32px;text-align:center"><img src="https://clean4jesus.com/icon.png" width="56" height="56" alt="Clean4Jesus" style="display:block;margin:0 auto 14px"/><div style="color:#fff;font-size:26px;font-weight:700">Clean4Jesus</div></td></tr><tr><td style="padding:34px"><h1 style="font-size:25px;margin:0 0 16px">Gracias por acompañar esta decisión</h1><p style="font-size:16px;line-height:1.6">Este es el PIN de protección. Guárdalo en un lugar seguro y no lo reenvíes:</p><p style="background:#f4f6fa;border:1px solid #e3e8f1;border-radius:14px;color:#102a63;font-size:30px;font-weight:700;letter-spacing:6px;padding:18px;text-align:center">${pin}</p><p style="font-size:15px;line-height:1.6">La persona que te eligió no verá este PIN en su teléfono. Podrá pedirte que lo ingreses cuando necesite cambiar una protección importante.</p><p style="font-size:13px;color:#52627e">Que Cristo guíe cada decisión.</p></td></tr></table></td></tr></table></div>`;
}

async function resetConfirmation(admin: ReturnType<typeof createClient>, token: string) {
  await admin.rpc("reset_guardian_pin_confirmation", {
    p_confirmation_token_hash: `\\x${await sha256Hex(token)}`,
  });
}
