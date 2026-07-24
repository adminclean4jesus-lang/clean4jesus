# CAPTCHA Turnstile

Estado: cliente movil implementado para ingreso, registro y recuperacion; challenge y widget publicados; activacion de Supabase pendiente del siguiente APK nativo.

## Arquitectura

- La app abre una pagina HTTPS dentro de `react-native-webview`.
- Cloudflare Turnstile genera un token corto y de un solo uso.
- La app envia ese token como `captchaToken` a Supabase Auth.
- Supabase valida el token con el secreto configurado en el Dashboard.
- El secreto nunca entra en Expo, Git, la pagina del reto ni el APK.

## 1. Publicar La Pagina Del Reto

Autorizar Wrangler una sola vez:

```powershell
cd C:\Users\maite\OneDrive\Escritorio\BlockerXChrist\clean4jesus
npx wrangler login
```

Publicar `web/` como Cloudflare Worker con Static Assets:

```powershell
npx wrangler deploy --config wrangler.turnstile.jsonc
```

El dominio personalizado configurado es:

```text
verify.clean4jesus.com
```

La URL final debe responder:

```text
https://verify.clean4jesus.com/turnstile/
```

## 2. Crear El Widget

En Cloudflare Dashboard > Turnstile:

1. Usar el widget llamado `Clean4Jesus Auth`.
2. Elegir modo `Managed`.
3. Autorizar solamente `verify.clean4jesus.com`.
4. La `site key` publica vive en `.env.local`; el `secret` privado solo se pega en Supabase.

## 3. Configurar La App

Agregar a `.env.local`:

```env
EXPO_PUBLIC_AUTH_CAPTCHA_ENABLED=true
EXPO_PUBLIC_TURNSTILE_SITE_KEY=TU_SITE_KEY_PUBLICA
EXPO_PUBLIC_TURNSTILE_CHALLENGE_URL=https://verify.clean4jesus.com/turnstile/
```

## 4. Activar Supabase Al Final

En Supabase Dashboard > Authentication > Bot and Abuse Protection:

1. Elegir Cloudflare Turnstile.
2. Pegar solo el `secret` privado en Supabase.
3. Activar CAPTCHA.

No activar el servidor antes de instalar una APK que incluya `react-native-webview` y esta integracion. De lo contrario, las APK anteriores no podran ingresar, registrarse ni recuperar contrasena.

## Prueba Obligatoria

1. Iniciar sesion desde Android.
2. Crear una cuenta nueva desde Android.
3. Solicitar recuperacion de contrasena.
4. Confirmar que los tres flujos muestran la comprobacion y llegan a Supabase.
5. Repetir sin red y comprobar que la app explica el fallo sin enviar el formulario.
6. Revisar Turnstile Analytics y Auth Logs.
