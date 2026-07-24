# Auth para beta externa

Estado: SMTP listo y probado; Turnstile integrado y publicado; falta probar el APK compatible y empujar el secret a Supabase.

## Que ya esta listo

- Registro con confirmacion obligatoria de correo.
- Inicio y persistencia segura de sesion con SecureStore y PKCE.
- Deep link `clean4jesus://auth/callback` para confirmacion, recuperacion y OAuth. Supabase permite el patron movil `clean4jesus://**`; Expo Router recibe este formato por la ruta compatible `/callback`.
- Recuperacion de contrasena de un solo uso.
- Eliminacion de cuenta con reautenticacion en Edge Function.
- Plantillas para confirmacion, recuperacion y aviso de cambio de contrasena.
- Verificacion automatica con `npm run test:auth:readiness`.
- Runtime version gate aplicado para Android desde `public.runtime_gates`.

## Decision de infraestructura

Usar un proveedor SMTP transaccional dedicado. Recomendacion inicial: Resend. No usar Gmail personal ni el correo gratuito de Supabase para una beta.

El remitente recomendado es `no-reply@auth.TU-DOMINIO.com`. El subdominio de autenticacion debe tener SPF, DKIM y DMARC configurados por el proveedor.

## Identidad visible en Acceder con Google

El texto tecnico `moqlovsxklxcpihvheyc.supabase.co` no se corrige desde la
interfaz movil. Google muestra el nombre y el dominio del cliente OAuth que
procesa el acceso.

El boton de la app puede decir `Continuar con Google`, pero no puede cambiar el
texto que Google renderiza en su propia pantalla de consentimiento. Ese nombre
se controla desde Google Auth Platform > Branding. El dominio visible depende
del cliente OAuth y del endpoint de Supabase que procesa el flujo.

Para que el usuario vea una identidad confiable:

1. En Google Auth Platform > Branding, configurar:
   - nombre de la app: `Clean4Jesus`;
   - logo oficial de Clean4Jesus;
   - pagina principal: `https://clean4jesus.com`;
   - privacidad y terminos bajo `clean4jesus.com`;
   - dominio autorizado: `clean4jesus.com`.
2. Publicar y completar la verificacion de marca de Google.
3. En Supabase, activar un dominio personalizado para la API, recomendado:
   `api.clean4jesus.com`.
4. Agregar en Google Cloud la URI de redireccion:
   `https://api.clean4jesus.com/auth/v1/callback`.
5. Mantener la URI anterior hasta comprobar el acceso con el nuevo dominio.

El dominio `auth.clean4jesus.com` ya se usa para correo transaccional y no debe
reutilizarse como CNAME de Supabase. El dominio personalizado de Supabase es un
complemento de pago; no activarlo sin aprobar primero ese costo.

## Datos que faltan

1. Prueba Android de ingreso, registro y recuperacion con el APK que incluye WebView.
2. Activacion final de Bot and Abuse Protection en Supabase con el secret privado de Turnstile.
3. Mantener `runtime_gates` sincronizado con la version minima soportada antes de abrir la beta.

Nunca guardar contrasenas SMTP ni secretos CAPTCHA en Git, `.env.local` o variables `EXPO_PUBLIC_*`.

## Orden seguro de activacion

1. La pagina HTTPS y el widget Turnstile ya estan publicados.
2. Construir e instalar el APK compatible con `react-native-webview`.
3. Probar ingreso, registro y recuperacion con CAPTCHA en Android.
4. Solo entonces exportar el secret y empujar la config de Auth a Supabase.
5. Ejecutar todo el preflight y las pruebas remotas antes de abrir la beta.

## Activacion exacta de Turnstile en Supabase

Desde PowerShell, dentro de `clean4jesus`:

```powershell
$env:SUPABASE_AUTH_CAPTCHA_SECRET="AQUI_VA_TU_SECRET_DE_TURNSTILE"
npm run supabase:auth:push
```

Luego volver a correr:

```powershell
npm run test:auth:readiness
```

Si todo quedo bien, el unico paso restante es marcar `config/production-readiness.json` con `serverEnabled: true` despues de comprobar el flujo real en Android.

### Que hace este paso

- activa `[auth.captcha]` en el proyecto remoto;
- fija `provider = "turnstile"`;
- usa el secret sin guardarlo en Git ni en Expo;
- deja el CAPTCHA exigiendose en registro, login y recuperacion.

El script `npm run supabase:auth:push` valida primero que el secret exista en la terminal y falle con un mensaje claro si falta.

### Importante

- No pongas el secret en `.env.local`.
- No pongas el secret en `EXPO_PUBLIC_*`.
- Si cierras la terminal, la variable se pierde y toca volver a exportarla para un nuevo `config push`.

## Criterio de salida

La beta puede abrirse cuando:

- `npm run test:auth:readiness` aprueba todos los controles.
- Un correo ajeno al equipo recibe confirmacion y recuperacion.
- Los enlaces abren la app instalada y no una pagina rota.
- CAPTCHA protege registro y recuperacion sin bloquear usuarios reales.
- La eliminacion de cuenta invalida el acceso y borra los datos esperados.
