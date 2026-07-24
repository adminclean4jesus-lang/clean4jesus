# Supabase Para Comunidad

Esta guia conecta Clean4Jesus 1.3 con un backend real sin exponer secretos dentro del APK.

## Despliegue Actual

- Proyecto: `Clean4Jesus`
- Organizacion: `Emmanuel Lopez`
- Project ref: `moqlovsxklxcpihvheyc`
- Region: `us-east-1`
- Dashboard: `https://supabase.com/dashboard/project/moqlovsxklxcpihvheyc`
- Migraciones de Comunidad, hardening y moderacion aplicadas el 14 de julio de 2026.
- Edge Functions `delete-account` y `moderate-community` desplegadas y activas.
- `runtime_gates` aplicado para bloquear APKs incompatibles desde servidor.
- Performance Advisor sin hallazgos. Security Advisor conserva dos advertencias aceptadas y documentadas para los RPC `SECURITY DEFINER` de moderacion, protegidos internamente por rol privado y `auth.uid()`.
- Prueba adversarial remota aprobada: aislamiento, minimo privilegio, moderacion atomica, idempotencia, concurrencia, separacion de roles y eliminacion completa.

El proyecto `Learning path TAAG Project` y los demas proyectos existentes no forman parte de Clean4Jesus y no deben modificarse desde este flujo.

## Arquitectura

- Supabase Auth gestiona correo, contrasena y sesion PKCE.
- `expo-secure-store` conserva la sesion cifrada en Android/iOS.
- Postgres guarda perfiles, publicaciones, apoyo en oracion, comentarios y reportes.
- Row Level Security (RLS) limita cada operacion segun `auth.uid()`.
- La proteccion del dispositivo, historial de bloqueo y Palabra siguen siendo datos locales.

## 1. Crear O Recuperar El Proyecto

1. Crear un proyecto en Supabase.
2. Guardar la region y la contrasena de base de datos en un gestor de contrasenas, no en el repositorio.
3. En `Project Settings > API`, copiar solamente:
   - Project URL.
   - Publishable key.

No copiar `service_role`, secret key ni la contrasena de Postgres dentro de Expo.

## 2. Configurar El Entorno Local

Crear `.env.local` en la raiz de `clean4jesus`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TU_CLAVE
```

`.env.local` esta ignorado por Git. `.env.example` si se conserva porque no contiene secretos.

## 3. Aplicar La Base De Datos

Desde la carpeta del proyecto:

```powershell
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
```

Las migraciones vigentes estan en:

```text
supabase/migrations/20260714225624_community_v1.sql
supabase/migrations/20260714235900_auth_hardening_v1.sql
supabase/migrations/20260715005037_community_moderation_v1.sql
supabase/migrations/20260715013200_fix_moderation_enum_transitions.sql
supabase/migrations/20260715020415_community_security_hardening_v2.sql
supabase/migrations/20260715034500_fix_moderation_version_conflict_contract.sql
supabase/migrations/20260715043000_active_sessions_and_moderation_truth.sql
supabase/migrations/20260715050000_require_active_session_for_moderation_queue.sql
```

No editar una migracion ya aplicada en produccion. Para cambios posteriores usar:

```powershell
npx supabase migration new nombre_del_cambio
```

## 4. Configurar Auth

En Supabase Dashboard:

1. Abrir `Authentication > Providers > Email`.
2. Mantener confirmacion de correo activa para pruebas cercanas a produccion.
3. Personalizar el correo con el nombre Clean4Jesus antes de invitar usuarios externos.
4. No desactivar protecciones anti-abuso para acelerar pruebas publicas.
5. En `Authentication > URL Configuration`, agregar `clean4jesus://**`.
6. Configurar SMTP propio antes de beta; el proveedor de prueba tiene limites bajos.
7. Configurar limites de Auth y CAPTCHA para registro y recuperacion.
8. Para Turnstile remoto usar este flujo:

```powershell
$env:SUPABASE_AUTH_CAPTCHA_SECRET="AQUI_VA_TU_SECRET_DE_TURNSTILE"
npm run supabase:auth:push
npm run test:auth:readiness
```

El secret vive solo en esa terminal. No va al APK ni al repositorio.

## 5. Desplegar Operaciones Privilegiadas

Las operaciones privilegiadas viven fuera del APK:

```powershell
npx supabase functions deploy delete-account
npx supabase functions deploy moderate-community
```

Supabase inyecta `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en la funcion. No copiar esos valores a variables `EXPO_PUBLIC_*`.

## 6. Reiniciar Expo

Despues de agregar `.env.local`, detener Metro y ejecutar:

```powershell
npm run dev-client
```

Expo lee las variables al iniciar el bundle; un QR viejo puede seguir mostrando “conexion pendiente”.

## Modelo De Datos

| Tabla | Responsabilidad |
| --- | --- |
| `profiles` | Identidad publica minima, nunca correo ni racha sensible |
| `community_posts` | Oraciones, testimonios y avances |
| `community_prayers` | Usuario que acompana una publicacion en oracion |
| `community_comments` | Respuestas de apoyo |
| `community_reports` | Reportes confidenciales para moderacion |

Los roles, casos y registros de auditoria de moderacion viven en el esquema `private`. La evidencia conserva snapshots durables; las acciones usan version esperada e idempotencia, y restaurar contenido requiere administrador con MFA.

## Seguridad Antes De Produccion

- Mantener RLS en todas las tablas publicas.
- Mantener las cuotas Postgres y operar la moderacion desde una consola interna separada antes de apertura general.
- Probar con al menos dos cuentas distintas: lectura, escritura, edicion propia y bloqueo de edicion ajena.
- Revisar logs y reportes sin exponer identidad del denunciante.
- Definir politica de privacidad, terminos comunitarios y procedimiento para contenido de crisis.
- Configurar SMTP transaccional propio y CAPTCHA antes de invitar usuarios externos.

Las plantillas de correo estan preparadas en `templates/auth-email/`, pero no se activan hasta configurar SMTP propio: el plan gratuito con proveedor por defecto rechaza la personalizacion. CAPTCHA tampoco debe activarse en servidor hasta integrar el token del proveedor en registro y recuperacion movil.

## Validacion Local

```powershell
npx tsc --noEmit
npm run test:unit
npm run test:e2e
npx expo export --platform web --clear
```

Despues de enlazar Supabase, ejecutar el ataque automatizado con dos cuentas temporales. Preferir Supabase local. Para staging remoto se exige confirmacion explicita:

```powershell
$env:SUPABASE_URL="https://TU-STAGING.supabase.co"
$env:SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
$env:SUPABASE_SERVICE_ROLE_KEY="solo_en_esta_terminal"
$env:ALLOW_REMOTE_SECURITY_TEST="true"
npm run test:supabase:security
npm run test:supabase:negative
Remove-Item Env:SUPABASE_SERVICE_ROLE_KEY
```

La suite negativa crea identidades aisladas y comprueba edicion de contenido oculto, hijos de posts ocultos, version requerida, idempotencia ligada al payload, evidencia tras borrado, cuota concurrente y revocacion efectiva por RLS despues de cerrar una sesion o eliminar una identidad.
