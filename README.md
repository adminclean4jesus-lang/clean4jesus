# Clean4Jesus

Clean4Jesus es una app mobile construida con Expo + React Native para ayudar a hombres y mujeres a sostener procesos de libertad frente a pornografia, masturbacion compulsiva y vulnerabilidad digital.

## Modulos Actuales

- **Refugio**: proteccion local con VPN/DNS y Accesibilidad en Android.
- **Palabra**: devocional diario y planes guiados.
- **Comunidad**: cuentas, perfiles, testimonios, pedidos de oracion, respuestas y reportes sobre Supabase.
- **Ajustes**: seguridad, notificaciones y configuracion.

## Estado

La base actual:

- compila,
- pasa TypeScript,
- pasa tests unitarios,
- pasa pruebas e2e,
- exporta web,
- y tiene Android nativo integrado.

**Importante:** el checkpoint del Refugio esta congelado desde la version `1.2.7`. No se modifica su logica salvo instruccion explicita de producto.

## Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Expo Router
- React Native Paper
- Reanimated
- AsyncStorage
- SecureStore
- Expo Notifications
- Kotlin para Android nativo
- Supabase Auth + Postgres + Row Level Security

## Estructura

```text
clean4jesus/
  app/
  src/
    components/
    config/
    data/
    features/
    services/
    types/
  android/
  tests/
  docs/
  artifacts/apk/
```

## Requisitos

- Node.js 20+
- npm 10+
- JDK 17
- SDK Android
- Dispositivo Android real para probar Refugio nativo

## Instalacion

```bash
cd clean4jesus
npm install
copy .env.example .env.local
```

La app sigue funcionando localmente sin Supabase, pero Comunidad mostrara un estado de conexion pendiente. La configuracion completa esta en [docs/SUPABASE-COMUNIDAD.md](./docs/SUPABASE-COMUNIDAD.md).

Para activar Turnstile del lado servidor en el proyecto real:

```powershell
$env:SUPABASE_AUTH_CAPTCHA_SECRET="AQUI_VA_TU_SECRET_DE_TURNSTILE"
npm run supabase:auth:push
npm run test:auth:readiness
```

## Comandos

### Desarrollo

```bash
npm run start
npm run web
npm run dev-client
npm run dev-client:tunnel
```

### Builds

```bash
npm run build:android:dev
npm run build:android:preview
```

### QA obligatoria

```bash
npx tsc --noEmit
npm run test:unit
npm run test:e2e
npx expo export --platform web --clear
```

## Probar En Celular

Usar siempre el QR del dev client:

```bash
cd C:\Users\maite\OneDrive\Escritorio\BlockerXChrist\clean4jesus
npm run dev-client
```

Si la red local falla:

```bash
npm run dev-client:tunnel
```

## Documentos Clave

- [docs/DIRECTIVAS-CLEAN4JESUS.md](./docs/DIRECTIVAS-CLEAN4JESUS.md)
- [docs/ROADMAP-CLEAN4JESUS-2026-06-15.md](./docs/ROADMAP-CLEAN4JESUS-2026-06-15.md)
- [docs/VERSION-HISTORY.md](./docs/VERSION-HISTORY.md)
- [docs/ANDROID-BLOQUEO-NATIVO.md](./docs/ANDROID-BLOQUEO-NATIVO.md)
- [docs/TESTING-CELULAR.md](./docs/TESTING-CELULAR.md)
- [docs/AUDITORIA-PROYECTO-2026-07-13.md](./docs/AUDITORIA-PROYECTO-2026-07-13.md)
- [docs/SUPABASE-COMUNIDAD.md](./docs/SUPABASE-COMUNIDAD.md)
- [docs/DEVOTIONAL-CONTENT-PIPELINE.md](./docs/DEVOTIONAL-CONTENT-PIPELINE.md)
- [docs/VERSION-GATE-OPERATIONS.md](./docs/VERSION-GATE-OPERATIONS.md)

## Politicas Del Proyecto

- Leer primero `docs/DIRECTIVAS-CLEAN4JESUS.md`.
- Leer tambien el roadmap antes de iniciar cambios grandes.
- No tocar lo que ya funciona si no esta en el pedido actual.
- Antes de cualquier APK: red team, QA obligatoria y recorrido funcional.
- Mantener solo dos APKs locales:
  - `artifacts/apk/current/Clean4Jesus-current.apk`
  - `artifacts/apk/previous/Clean4Jesus-previous.apk`

## Riesgos Conocidos

- La capa nativa Android sigue siendo la parte mas sensible.
- Comunidad 1.3 esta implementada, pero requiere enlazar un proyecto Supabase y aplicar su migracion antes de pruebas reales.
- Palabra consume un catalogo editorial remoto con cache y respaldo local; el progreso personal permanece local-first.
