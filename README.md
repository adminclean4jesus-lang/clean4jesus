# Clean4Jesus

Clean4Jesus es una aplicación móvil de acompañamiento para vivir con mayor libertad frente a la pornografía, la masturbación compulsiva y otros entornos digitales vulnerables. Reúne protección local, Palabra, Comunidad y herramientas de apoyo sin vender la protección como vigilancia absoluta.

## Estado del proyecto

| Componente | Estado actual |
| --- | --- |
| Versión de la app | `1.3.30` |
| Android | `versionCode 50`; beta técnica con protección nativa mediante VPN local, Accesibilidad e interrupción |
| iOS | `build 21`; PIN de guardianía, límites independientes y Shield con logo oficial Clean4Jesus |
| Backend | Supabase para autenticación, comunidad, contenido y moderación |
| Idiomas | Español, inglés, francés y portugués brasileño; el idioma inicial sigue al dispositivo |
| Distribución iOS | IPA firmada generada manualmente en GitHub Actions después del merge |

La versión `1.3.30 (build 21)` parte del checkpoint estable `1.3.25 (build 16)`. En iOS la app abre sin PIN; el PIN de guardianía se configura después del primer límite y protege cualquier cambio posterior de apps o tiempos. Detecta el idioma nativo del dispositivo, asigna un límite independiente a cada app seleccionada y aplica el Shield únicamente a la app que alcanza su propio umbral. En iOS 17.4 o posterior, cada límite incorpora el uso de esa app desde el inicio del día, incluso si la regla se configura después; iOS 16–17.3 solo permite iniciar el conteo cuando comienza el monitoreo. El Shield carga la marca oficial de Clean4Jesus desde su propio bundle, usa azul marino, blanco y dorado de acento, y conserva una sola acción honesta de cierre; el rescate guiado se mantiene exclusivamente en Android. El contador exacto usado/restante queda pendiente de una cuarta extensión `DeviceActivityReport` con perfil de firma propio de Apple; esta build no inventa ni expone esos datos privados.

## Funcionalidades

- **Refugio**: configura el PIN y guía la activación de la protección nativa adecuada para cada plataforma.
- **Palabra**: devocional diario, catálogo de planes, detalle por día, progreso local y recordatorios.
- **Comunidad**: autenticación, perfiles, publicaciones, testimonios, pedidos de oración, respuestas y reportes.
- **Mi perfil y Ajustes**: identidad, idioma, tema, aplicaciones protegidas, persona de confianza, personalización y opciones avanzadas.
- **Rescate**: recorrido guiado de 60 segundos para interrumpir una situación de riesgo.
- **Moderación interna**: revisión humana de reportes con roles, MFA y auditoría.

## Protección en Android

Android usa componentes Kotlin incluidos en la aplicación nativa:

- Un `VpnService` local dirige la resolución DNS hacia un filtro familiar para bloquear dominios conocidos, incluso desde navegación privada.
- Un `AccessibilityService` detecta aplicaciones protegidas y señales visibles de riesgo cuando Android las expone.
- Una pantalla nativa de interrupción saca la aplicación vulnerable del frente y ofrece regreso al Refugio, validación con PIN o desbloqueo temporal.
- Las reglas permiten proteger aplicaciones completas, aplicar límites diarios y conservar desbloqueos temporales.
- El usuario puede personalizar el mensaje, la referencia y la imagen de la interrupción.
- La aplicación sincroniza el idioma seleccionado con las superficies nativas.
- Los falsos positivos pueden reportarse sin enviar PIN, historial, mensajes, capturas, texto completo ni URL completa.

Para activar toda la protección, el usuario debe autorizar la VPN local y Accesibilidad desde los ajustes de Android. Expo Go no puede ejecutar estos servicios: se necesita una APK o development build de Clean4Jesus.

### Límites de Android

- La VPN filtra dominios; no interpreta imágenes ni inserta contenido dentro de páginas HTTPS.
- Accesibilidad solo puede analizar la información que Android y cada aplicación exponen.
- Clean4Jesus no puede terminar procesos de terceros como una aplicación con root; la acción estable es sacar la aplicación del frente y mostrar la interrupción.
- El usuario conserva la posibilidad de revocar VPN o Accesibilidad desde Ajustes.

La implementación y el recorrido manual están documentados en [Bloqueo nativo Android](./docs/ANDROID-BLOQUEO-NATIVO.md).

## Protección en iOS

iOS usa las tecnologías oficiales de Screen Time de Apple y no utiliza VPN ni Accesibilidad:

- `FamilyControls` solicita la autorización individual mediante el diálogo del sistema.
- `FamilyActivityPicker` permite elegir aplicaciones, categorías y dominios sin revelar sus nombres a Clean4Jesus.
- `ManagedSettings` aplica los Shields a la selección guardada.
- `DeviceActivity` y la extensión de monitor permiten mantener la protección programada.
- Las extensiones `ShieldConfiguration` y `ShieldAction` presentan y gestionan la interrupción nativa.
- El App Group `group.com.clean4jesus.app` comparte de forma controlada el estado, la selección y el hash del PIN con las extensiones.
- El estado nativo de Family Controls gobierna el acceso a Palabra, Comunidad, Perfil y Ajustes.
- La primera instalación pide crear y confirmar el PIN; las siguientes aperturas solicitan verificarlo.

El selector de Apple devuelve únicamente cantidades de aplicaciones, categorías y sitios. Esta limitación de privacidad es deliberada: la app puede confirmar que existe una selección, pero no mostrar los nombres elegidos.

### Recorrido esperado en iPhone

1. Abre una instalación nueva y crea el PIN escribiéndolo dos veces.
2. En Refugio, pulsa **Autorizar Family Controls**.
3. Acepta el diálogo oficial de Apple.
4. Elige aplicaciones, categorías o sitios en el selector del sistema y confirma.
5. Verifica el resumen de la selección y activa el Refugio.
6. Comprueba que un elemento elegido muestre el Shield y que el estado persista después de cerrar y abrir la app.

Family Controls requiere iOS 16 o posterior, los entitlements y perfiles correctos, y una prueba final en hardware real. El simulador valida compilación, puente nativo, navegación y estabilidad, pero no demuestra por sí solo el consentimiento ni el bloqueo final de Apple.

Consulta [Handoff de Apple](./docs/IOS-APPLE-HANDOFF.md), [contrato de permisos iOS](./docs/IOS-NATIVE-PERMISSIONS-CONTRACT.md) y [matriz QA de dispositivos iOS](./docs/IOS-DEVICE-QA-MATRIX.md).

## Arquitectura y datos

- **Cliente**: Expo SDK 54, React Native 0.81, React 19, TypeScript y Expo Router.
- **Interfaz**: React Native Paper, Reanimated, Worklets, modo claro/oscuro e internacionalización.
- **Persistencia local**: AsyncStorage y SecureStore; el PIN no se almacena en texto plano en iOS.
- **Android nativo**: Kotlin, VPN local, Accesibilidad y Activity de interrupción.
- **iOS nativo**: Swift, Expo Modules, Family Controls, Managed Settings, Device Activity y tres extensiones Screen Time.
- **Backend**: Supabase Auth, Postgres, RLS, RPCs y Edge Functions.
- **QA**: Vitest, Playwright, Maestro, TypeScript, Expo Doctor y builds Release de iOS.

Supabase gestiona autenticación por correo y contraseña, confirmación, recuperación, PKCE, Google OAuth, comunidad y contenido editorial. Las tablas sensibles usan RLS; el cliente consume el catálogo y el devocional mediante RPCs públicas controladas. El progreso espiritual permanece local durante esta fase.

```text
clean4jesus/
  app/                    # rutas y pantallas de Expo Router
  src/                    # funcionalidades, servicios, componentes y tipos
  android/                # servicios y superficies nativas Android
  modules/                # módulo Expo/Swift de protección iOS
  targets/                # extensiones Device Activity y Shield de iOS
  supabase/               # migraciones, funciones y contratos de datos
  moderation-console/     # consola interna de moderación
  web/                    # landing, soporte y superficies legales
  scripts/                # validaciones y operaciones controladas
  tests/                  # pruebas unitarias, E2E y contratos
  .maestro/               # recorridos de interfaz iOS
  .github/workflows/      # QA y generación manual de IPA
  docs/                   # arquitectura, operación, QA y legal
  assets/                 # identidad y recursos aprobados
```

## Desarrollo local

### Requisitos

- Node.js 20 o superior y npm 10 o superior.
- JDK 17, Android SDK y Android Studio para Android.
- macOS y Xcode para una compilación local de iOS.
- Dispositivo físico para validar la protección nativa de cada plataforma.
- Variables públicas de Supabase y autenticación configuradas a partir de `.env.example`.

```bash
cd clean4jesus
npm install
copy .env.example .env.local
```

No subas `.env.local`, certificados, perfiles, contraseñas, tokens, APK, AAB, IPA, cachés ni artefactos temporales al repositorio.

### Ejecutar el cliente

```bash
npm run start
npm run web
npm run dev-client
npm run dev-client:tunnel
```

El QR de `dev-client` requiere una development build instalada. Una APK o IPA Release no depende de Metro ni de un QR.

### Builds Android

```bash
npm run build:android:dev
npm run build:android:preview
```

- `development`: APK con development client para probar módulos nativos.
- `preview`: APK instalable y autónoma para QA.
- `production`: AAB configurado en `eas.json` para una futura publicación.

### Build iOS desde GitHub

La IPA se genera únicamente después de fusionar el pull request aprobado:

1. Sube los cambios a una rama.
2. Crea el pull request hacia `main` con título y descripción en español.
3. Espera las verificaciones y realiza el merge.
4. En GitHub Actions abre **iOS local build on GitHub macOS**.
5. Pulsa **Run workflow** sobre `main`.
6. Descarga el artifact `clean4jesus-ios-ipa-vX.Y.Z-build-N`.

El artifact contiene solamente `Clean4Jesus.ipa`. Para la versión actual, el nombre esperado es `clean4jesus-ios-ipa-v1.3.30-build-21`. Cada IPA nueva debe incrementar `expo.ios.buildNumber`; cambiar únicamente el código sin aumentar el build puede hacer que se vuelva a instalar una versión anterior o indistinguible.

## Validación

Antes de proponer un merge, ejecuta:

```bash
npx tsc --noEmit
npm run test:unit
npx expo-doctor
npm run test:e2e
npm run test:auth:readiness
npm run test:auth:surfaces
npm run test:supabase:security
npm run test:supabase:negative
```

El workflow **iOS Release startup smoke** valida TypeScript, pruebas unitarias, Expo Doctor, compilación Release y estabilidad de inicio con Maestro. Una ejecución verde no reemplaza la aceptación manual de Family Controls y Shield en un iPhone firmado.

## Flujo de Git y releases

- Trabaja en una rama específica; no empujes cambios de producto directamente a `main`.
- Publica la rama y entrega un título y una descripción de pull request en español.
- El usuario crea el pull request, espera las verificaciones y decide el merge.
- El workflow de IPA se ejecuta manualmente después del merge.
- `package.json` y `app.json` deben declarar la misma versión.
- Android incrementa `versionCode`; iOS incrementa `buildNumber`.
- No crees PR, no hagas merge, no publiques releases y no ejecutes workflows sin autorización explícita.

Repositorio privado oficial: `adminclean4jesus-lang/clean4jesus`.

## Documentación principal

- [Índice de documentación](./docs/INDEX.md)
- [Directivas persistentes](./docs/DIRECTIVAS-CLEAN4JESUS.md)
- [Roadmap beta y Play Store](./docs/ROADMAP-BETA-PLAYSTORE.md)
- [Historial de versiones](./docs/VERSION-HISTORY.md)
- [Pruebas en celular](./docs/TESTING-CELULAR.md)
- [Arquitectura de Supabase Comunidad](./docs/SUPABASE-COMUNIDAD.md)
- [Preparación de autenticación](./docs/AUTH-PRODUCTION-SETUP.md)
- [Arquitectura de contenido de Palabra](./docs/PALABRA-CONTENT-ARCHITECTURE.md)
- [Pipeline de contenido editorial](./docs/DEVOTIONAL-CONTENT-PIPELINE.md)
- [Bloqueo nativo Android](./docs/ANDROID-BLOQUEO-NATIVO.md)
- [Arquitectura de protección iOS](./docs/ADR-006-IOS-PROTECTION-ARCHITECTURE.md)
- [Handoff de Apple](./docs/IOS-APPLE-HANDOFF.md)
- [Contrato de permisos iOS](./docs/IOS-NATIVE-PERMISSIONS-CONTRACT.md)
- [Operación del control de versiones](./docs/VERSION-GATE-OPERATIONS.md)

## Antes de una beta pública

- Completar la matriz de QA en varios dispositivos Android e iPhone.
- Validar en iPhone físico autorización, selección, Shield, persistencia y revocación.
- Completar firma de producción, Play App Signing, TestFlight y App Store Connect.
- Finalizar Data Safety, declaraciones de VPN/Accesibilidad y textos legales de las tiendas.
- Realizar revisión editorial humana de traducciones y contenido bíblico.
- Mantener operativos los canales públicos de soporte, privacidad y respuesta a incidentes.

Clean4Jesus es una herramienta de apoyo y acompañamiento. No sustituye atención médica, psicológica, pastoral ni de emergencia, y no promete bloquear absolutamente todo el contenido de riesgo.
