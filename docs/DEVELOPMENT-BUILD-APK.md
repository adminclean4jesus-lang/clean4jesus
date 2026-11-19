# Development Build / APK Clean4Jesus

La guía operativa completa y vigente está en `REPOSITORY-OPERATIONS.md`. Android se compila localmente con Gradle; EAS se reserva para iOS.

> Regla vigente: la APK entregable es standalone release, no requiere Metro ni QR y se genera desde `C:\Users\millo\Desktop\Clean4Jesus` con `npm run build:android:local`. Este documento conserva notas de development build solo para depuración explícita.

Esta guia es para probar Clean4Jesus como app instalada en tu Google Pixel 9, fuera de Expo Go.

## Por Que Lo Necesitamos

Expo Go sirve para UI, tabs, habitos y devocional. No sirve para:

- Android `VpnService`
- `AccessibilityService`
- permisos especiales de Android
- pantalla de interrupcion encima de otras apps

Para eso usamos una **development build**: una app Clean4Jesus propia con herramientas de desarrollo.

## Estado Del Proyecto

- Expo SDK 54.
- `expo-dev-client` instalado.
- Android package: `com.clean4jesus.app`.
- Carpeta nativa `android/` generada y debe permanecer versionada.
- Versión declarada actual: `1.3.46 (versionCode 59)`.

## Primer APK De Desarrollo

En una terminal normal de Windows:

```bash
cd C:\Users\millo\Desktop\Clean4Jesus
npm run build:android:local
```

El repositorio Desktop es la fuente de verdad; OneDrive está prohibido. Si Gradle requiere una ruta corta, crea una copia temporal en `C:\c4j`, instala dependencias limpias allí y vuelve a copiar únicamente el APK terminado a la ruta canónica. No copies `.gradle` ni carpetas `build/` entre rutas absolutas. Antes de usar Metro para depuración explícita, crea `.env.local` desde `.env.example` con la URL y clave **publicable** de Supabase; nunca pongas allí una service role key.

La APK queda en `artifacts/apk/current/Clean4Jesus-current.apk`; el comando rota automáticamente la anterior a `artifacts/apk/previous/Clean4Jesus-previous.apk`.
`android/build.gradle` evita en Windows que Gradle intente tomar snapshots de enlaces `libc++_shared.so` generados por el NDK; la compilación en macOS/Linux conserva el seguimiento incremental normal.
Antes de promover una APK de QA, ejecuta también `cd android; .\gradlew.bat :app:lintDebug --no-daemon --max-workers=1` desde la copia corta. No confundas `assembleDebug` con lint aprobado.

## Instalar En Pixel 9

1. Abre la APK local transferida al teléfono o instala por USB con `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`.
2. Si Android bloquea la instalacion, toca **Ajustes**.
3. Activa **Permitir desde esta fuente** solo para el navegador o app desde donde descargaste.
4. Vuelve atras y toca **Instalar**.
5. Abre **Clean4Jesus** desde el launcher del telefono.

## Conectar La App Al PC

La development build necesita Metro para cargar el JavaScript durante desarrollo:

```bash
npm run dev-client
```

Abre Clean4Jesus en el Pixel 9. Si no conecta:

- Asegura que PC y celular esten en la misma Wi-Fi.
- Desactiva VPN del PC/celular temporalmente.
- Permite Node/Expo en Firewall de Windows.
- Reinicia la app Clean4Jesus.
- Si sigue fallando, usa el tunnel:

```bash
npm run dev-client:tunnel
```

En Windows, Expo requiere que `@expo/ngrok` esté instalado globalmente para usar `--tunnel`:

```bash
npm install -g @expo/ngrok
```

Si aparece `Cannot read properties of undefined (reading 'body')`, confirma primero que `@expo/ngrok` esté instalado y que `https://status.ngrok.com/` esté operativo. El túnel publica temporalmente Metro mediante una URL externa; ciérralo con `Ctrl+C` al terminar la prueba y no compartas el QR fuera del equipo autorizado.

- Si vas por USB, usa:

```bash
npm run dev-client:localhost
adb reverse tcp:8081 tcp:8081
```

## APK o AAB release

La publicación en Play requiere una clave release local, Play App Signing y las declaraciones aprobadas. No uses el certificado debug. El build release se hace con Gradle local y no depende de Metro.

## Siguiente prueba nativa

En Pixel 9 y un segundo Android, valida VPN, Accesibilidad, pantalla de interrupción, PIN, WhatsApp OFF/ON, bancos/YouTube, reinicio, pérdida de red y aviso genérico del modo acompañado. Registra la versión y firma de la APK usada.

## Despues De Instalar Dependencias Nativas

Si se instala una dependencia nativa nueva, por ejemplo `expo-intent-launcher`, la app instalada debe reconstruirse:

```bash
npm run build:android:local
```

Los cambios solo JavaScript cargan con `npm run dev-client`; las dependencias nativas requieren APK nuevo.
Si Metro no carga en el telefono, prueba `npm run dev-client:tunnel` antes de reconstruir el APK.
