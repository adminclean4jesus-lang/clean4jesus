# Clean4Jesus

Clean4Jesus es una aplicacion mobile de apoyo para la libertad frente a la pornografia, la masturbacion compulsiva y la vulnerabilidad digital. Combina proteccion local, palabra, comunidad y herramientas de acompañamiento.

## Estado Actual

Version de producto: `1.3.13`.

La base actual funciona como un proyecto interno de desarrollo y beta tecnica:

- Expo SDK 54 + React Native 0.81.
- Android nativo integrado para Refugio, VPN local, Accesibilidad e interrupcion.
- Comunidad enlazada a Supabase real.
- Autenticacion por correo y contrasena, confirmacion de correo, recuperacion, PKCE y Google OAuth.
- Perfiles, publicaciones, testimonios, pedidos de oracion, respuestas, reportes y moderacion.
- CAPTCHA de Cloudflare Turnstile en los flujos de autenticacion.
- Catalogo de planes y devocional diario publicados en Supabase, con cache local y respaldo offline.
- Internacionalizacion inicial para español, ingles, frances y portugues brasileño.
- Modo claro y oscuro, personalizacion local de la pantalla de interrupcion y rescate guiado de 60 segundos.
- Backup oficial en el repositorio privado de GitHub: `adminclean4jesus-lang/clean4jesus`.

El checkpoint funcional del Refugio permanece congelado. Los cambios en bloqueo, VPN, Accesibilidad, PIN, cierre de aplicaciones o pantalla nativa requieren solicitud explicita y nueva validacion en Android real.

## Modulos

- **Refugio**: proteccion local con VPN/DNS, Accesibilidad, PIN, pantalla de interrupcion, cierre de la app bloqueada y rescate guiado opcional.
- **Palabra**: devocional diario, catalogo de planes, detalle por dia, progreso local, recordatorios y contenido remoto escalable.
- **Comunidad**: autenticacion, perfil, publicaciones, testimonios, pedidos de oracion, respuestas, reportes y moderacion.
- **Mi perfil y Ajustes**: identidad local, idioma, modo claro/oscuro, proteccion de apps, persona de confianza, personalizacion y opciones avanzadas.
- **Consola interna**: revision humana de reportes, moderacion con roles, MFA y auditoria inmutable.

## Arquitectura De Datos

Supabase ya esta conectado al proyecto como backend remoto:

- **Auth**: correo/contrasena y Google OAuth, con SecureStore/PKCE en el cliente.
- **Postgres**: RLS activa y permisos directos restringidos.
- **Contenido editorial**: el cliente usa RPCs publicas y seguras; no consulta tablas editoriales directamente.
- **Planes**: el catalogo se descarga con `get_devotional_plan_catalog`; el contenido completo se solicita al abrir un plan mediante `get_devotional_plan_detail`.
- **Devocional diario**: se solicita por fecha e idioma mediante `get_daily_devotional`.
- **Falsos positivos**: los reportes llegan a una cola privada; nunca se envian texto, URL, historial, mensajes, capturas ni PIN.
- **Moderacion**: las decisiones humanas requieren roles autorizados y MFA; no cambian reglas de bloqueo automaticamente.
- **Progreso espiritual**: inscripciones, dias completados y rachas siguen siendo locales durante esta fase.

Las migraciones aplicadas son inmutables. Todo cambio de esquema o contenido remoto debe crear una migracion nueva y aumentar la version correspondiente.

## Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Expo Router
- React Native Paper
- Reanimated y Worklets
- AsyncStorage
- SecureStore
- Expo Notifications
- Supabase Auth, Postgres, RLS, RPCs y Edge Functions
- Kotlin para integraciones Android nativas
- Base de arquitectura iOS: Expo Router compartido, perfiles EAS de iOS y frontera de protección preparada para Family Controls, Managed Settings y Device Activity
- Playwright y Vitest para QA

## Estructura

```text
clean4jesus/
  app/                    # rutas Expo Router
  src/                    # features, componentes, servicios y tipos
  android/                # servicio VPN, Accesibilidad e interrupcion nativa
  supabase/               # migraciones, funciones y contratos de datos
  moderation-console/     # consola interna de trust and safety
  web/                    # superficies web legales y soporte
  scripts/                # validaciones, semillas y operaciones
  tests/                  # unitarias, e2e y contratos
  docs/                   # directivas, roadmap, legal y arquitectura
  assets/                 # identidad y recursos aprobados
  artifacts/apk/          # solo las dos APKs rotativas permitidas
```

## Requisitos

- Node.js 20+
- npm 10+
- JDK 17
- Android SDK
- Android Studio para compilacion local
- Dispositivo Android real para validar Refugio nativo
- Cuenta y proyecto Supabase para Auth, base de datos, funciones y contenido

## Configuracion Local

```bash
cd clean4jesus
npm install
copy .env.example .env.local
```

Completa `.env.local` con las variables indicadas en `.env.example`. Este archivo nunca debe subirse a GitHub. El repositorio conserva solo la plantilla `.env.example`.

La configuracion detallada de Supabase esta en [docs/SUPABASE-COMUNIDAD.md](./docs/SUPABASE-COMUNIDAD.md). La preparacion de autenticacion y CAPTCHA esta en [docs/AUTH-PRODUCTION-SETUP.md](./docs/AUTH-PRODUCTION-SETUP.md).

## Comandos

### Desarrollo

```bash
npm run start
npm run web
npm run dev-client
npm run dev-client:tunnel
```

El QR correcto para el telefono es el que imprime `npm run dev-client` o `npm run dev-client:tunnel`. Una APK debug/dev-client necesita Metro; una APK release no necesita QR.

### Builds Android

```bash
npm run build:android:dev
npm run build:android:preview
```

No generar un build por cada ajuste pequeno. Antes de una APK se exige QA, red team, preview movil y recorrido funcional. Mantener como maximo dos APKs locales: `current` y `previous`.

### Preparación iOS

```bash
npm run prebuild:ios
npm run build:ios:simulator
npm run build:ios:preview
npm run build:ios:production
```

La interfaz compartida ya puede compilarse para iOS. La protección nativa de iPhone no se declara activa hasta contar con Apple Developer Program, entitlements aprobados de Family Controls/Network Extension, extensiones nativas y validación física en iPhone. Consulta [docs/IOS-MIGRATION-PLAN.md](./docs/IOS-MIGRATION-PLAN.md).

### QA Y Seguridad

```bash
npx tsc --noEmit
npm run test:unit
npm run test:e2e
npm run test:auth:readiness
npm run test:auth:surfaces
npm run test:supabase:security
npm run test:supabase:negative
npx expo export --platform web --clear
```

## Git Y Backup

El repositorio privado oficial es:

```text
https://github.com/adminclean4jesus-lang/clean4jesus
```

Cada cambio relevante debe terminar con un commit fechado y un `push` a `origin/main`.

```bash
git add .
git commit -m "tipo: resumen del cambio - AAAA-MM-DD"
git push
```

No subir `.env`, claves, credenciales, APKs, AABs, caches ni artefactos temporales. `.gitignore` y `.env.example` forman parte del control de seguridad del repositorio.

## Documentos Clave

- [Directivas persistentes](./docs/DIRECTIVAS-CLEAN4JESUS.md)
- [Roadmap beta y Play Store](./docs/ROADMAP-BETA-PLAYSTORE.md)
- [Historial de versiones](./docs/VERSION-HISTORY.md)
- [Arquitectura de Supabase Comunidad](./docs/SUPABASE-COMUNIDAD.md)
- [Preparacion de Auth](./docs/AUTH-PRODUCTION-SETUP.md)
- [Pipeline de contenido editorial](./docs/DEVOTIONAL-CONTENT-PIPELINE.md)
- [Arquitectura de contenido de Palabra](./docs/PALABRA-CONTENT-ARCHITECTURE.md)
- [Bloqueo Android nativo](./docs/ANDROID-BLOQUEO-NATIVO.md)
- [Arquitectura de protección iOS](./docs/ADR-006-IOS-PROTECTION-ARCHITECTURE.md)
- [Plan de migración iOS](./docs/IOS-MIGRATION-PLAN.md)
- [QA en celular](./docs/TESTING-CELULAR.md)
- [Auditoria del proyecto](./docs/AUDITORIA-PROYECTO-2026-07-13.md)
- [Operaciones de version gate](./docs/VERSION-GATE-OPERATIONS.md)

## Pendientes Antes De Beta Publica

- Auditoria y adaptacion completa para iOS.
- Firma release y Play App Signing.
- Data Safety, disclosures de VPN/Accesibilidad, legal y privacidad finales.
- QA en varios fabricantes y tamaños Android.
- Validacion editorial humana de traducciones y contenido biblico.
- Buzones publicos de soporte y privacidad operativos.
- Pruebas de carga, moderacion, recuperacion y respuesta a incidentes.

## Politicas Del Proyecto

- Leer primero `docs/DIRECTIVAS-CLEAN4JESUS.md`.
- Leer el roadmap antes de cambios grandes.
- No tocar checkpoints aprobados sin solicitud explicita.
- Validar modo claro y oscuro en Android movil.
- No presentar una beta publica como lista hasta cerrar QA, seguridad, legal, privacidad y release.
