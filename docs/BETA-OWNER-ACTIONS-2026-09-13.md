# Acciones de la persona titular para la candidata beta 1.3.36

Fecha: 13 de septiembre de 2026. Esta es una hoja operativa; marcar cada casilla solo con evidencia. `1.3.35` es la última versión distribuida y `1.3.36` sigue en QA.

La APK `1.3.36 (54)` de `artifacts/apk/current` ya se compiló y verificó como debug universal. SHA-256: `8E40C5A4139E4740EDC3412E592F989E87756870F0558B182621D08B7FAE41A8`. `previous` conserva `1.3.35 (53)`; solo hay dos APK locales.

## 1. Android real y matriz de protección

- [ ] Conectar el Pixel por USB, habilitar depuración USB y aceptar la huella del PC. Comprobar `adb devices -l`: debe aparecer `device`, no `unauthorized`.
- [ ] Instalar la APK `artifacts/apk/current/Clean4Jesus-current.apk` después de confirmar que informa `1.3.36 (54)` y firma debug. Es solo para QA interna; necesita `npm run dev-client` y conexión al PC. Antes, crear `.env.local` desde `.env.example` con la URL/clave **publicable** real de Supabase y el CAPTCHA público, sin incluir jamás la service role key. Ejecutar Metro desde `C:\c4j\beta-1.3.36`.
- [ ] Probar VPN, Accesibilidad, interrupción, salida con PIN, WhatsApp/Business OFF por defecto, activación con aviso, desactivación con PIN, bancos y YouTube sin interrupción. Durante un desbloqueo deliberado de 15 minutos, abrir contenido adulto distinto en esa app: debe seguir interrumpiéndose.
- [ ] Repetir la instalación y regresiones en un Android de otro fabricante. Registrar modelo, versión Android, fecha, versión/firma de APK, red, pasos y resultado.
- [ ] En un dispositivo/cuenta desechables con modo acompañado aceptado, desactivar protección y verificar el aviso genérico después del periodo de gracia y cron; solo después probar desinstalación. Nunca afirmar bloqueo de desinstalación del sistema.

Usar `TESTING-CELULAR.md` y `ANDROID-MODO-ACOMPANADO.md` para los pasos completos. No compartir capturas con PIN, mensajes o navegación personal.

## 2. Supabase y correo

- [ ] Iniciar sesión en Supabase CLI desde este PC (`npx supabase login`) y vincular el proyecto existente `moqlovsxklxcpihvheyc` (`npx supabase link --project-ref moqlovsxklxcpihvheyc`). No crear un proyecto nuevo ni publicar tokens.
- [ ] Ejecutar `npx supabase migration list --linked` y `npx supabase db push --linked --dry-run`. Revisar que solo estén pendientes las migraciones esperadas `20260830120000_false_positive_rate_limit_v2.sql`, `20260913120000_accountability_invite_privacy_v2.sql` y `20260913130000_privacy_retention_v2.sql`; si aparece deriva u otras migraciones, detener el push y revisar.
- [ ] Aplicar `npx supabase db push --linked`. Luego desplegar, sin `--prune`, `npx supabase functions deploy report-false-positive accountability accountability-health --project-ref moqlovsxklxcpihvheyc --no-verify-jwt --use-api`. Confirmar en Dashboard que las tres funciones están activas, que la RPC nueva no concede acceso a `anon` y que el cron `clean4jesus-privacy-retention` ejecuta la función reparada sobre `public.false_positive_reports` y la tabla de eventos.
- [ ] Configurar/verificar en Supabase los secretos `RESEND_API_KEY`, `ACCOUNTABILITY_FROM_EMAIL` y `ACCOUNTABILITY_SCHEDULER_SECRET`, y los valores de Vault descritos en `ANDROID-MODO-ACOMPANADO.md`. Confirmar que el remitente pertenece a un dominio verificado en Resend. Guardar secretos solo en el proveedor o equipo local.
- [ ] Con dos cuentas de prueba consentidas, enviar invitación y comprobar entrega; después desactivar la protección y verificar un solo aviso de salud con versión texto/HTML. Confirmar el cron `clean4jesus-accountability-health-dispatch` cada 15 minutos y los reintentos. Ejecutar las suites remotas con variables locales y `ALLOW_REMOTE_SECURITY_TEST=true` únicamente en el proyecto previsto.

No se aplicó ninguna migración ni se hizo un envío real desde este PC: la CLI no tiene sesión Supabase y faltan las variables de QA.

## 3. iPhone y TestFlight

- [ ] En App Store Connect, comprobar estado de procesamiento, fecha y testers internos de `1.3.35 (25)`; aceptar invitaciones pendientes. Registrar el resultado.
- [ ] Después de aprobar el PR de `1.3.36 (26)`, ejecutar el workflow iOS de GitHub/macOS, comprobar firma/entitlements de la app y cuatro extensiones y subir la IPA nueva a TestFlight.
- [ ] En iPhone real, ejecutar `IOS-DEVICE-QA-MATRIX.md`, especialmente PIN ante deep links, cambio de selección con protección activa, límites independientes, Shield efectivo, permiso revocado y estados de “Uso de hoy”. La IPA `25` no valida correcciones de `26`.

## 4. Firma, legal y operación de beta

- [ ] Antes de beta externa, revisar el informe `npm audit --omit=dev --audit-level=high`: hoy registra 16 alertas altas y 22 moderadas en el árbol de Expo/React Native y dependencias transitivas. El cambio mayor de SDK requiere una rama y regresión nativa/iPhone; no aplicar `npm audit fix --force` a la candidata congelada.
- [ ] Crear y custodiar fuera de Git la clave release Android definitiva; configurar Play App Signing. Generar AAB local con Gradle y verificar certificado, permisos y versión antes de Play Console. No subir una build firmada con debug.
- [ ] Revisar con abogado colombiano privacidad, términos, edad, comunidad, eliminación, licencias bíblicas y declaraciones de `VpnService`/Accesibilidad y Data Safety. Ver `legal/BETA-LEGAL-READINESS.md`, `legal/GOOGLE-PLAY-DATA-SAFETY.md` e `IOS-APP-STORE-PREPARATION.md`.
- [ ] Probar eliminación de cuenta extremo a extremo, MFA de cada moderador y un simulacro de moderación/crisis según `MODERATION-RUNBOOK.md`.
- [ ] Aprobar las fichas y capturas reales de las tiendas antes de invitar testers externos. Conservar evidencia de todos los gates; la beta externa sigue en NO-GO hasta cerrar los pendientes anteriores.
