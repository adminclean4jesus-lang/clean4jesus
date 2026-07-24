# Development Build / APK Clean4Jesus

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
- Perfiles EAS configurados en `eas.json`.

## Primer APK De Desarrollo

En una terminal normal de Windows:

```bash
cd C:\Users\maite\OneDrive\Escritorio\BlockerXChrist\clean4jesus
npm run eas:login
npm run build:android:dev
```

Si quieres confirmar la sesion:

```bash
npm run eas:whoami
```

Cuando EAS termine, la terminal muestra un enlace. Abre ese enlace desde tu Pixel 9 y descarga el APK.

## Instalar En Pixel 9

1. Abre el APK descargado.
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

- Si vas por USB, usa:

```bash
npm run dev-client:localhost
adb reverse tcp:8081 tcp:8081
```

## APK Preview

Cuando quieras probar una app mas parecida a usuario final:

```bash
npm run build:android:preview
```

Este APK no depende de Metro para abrir.

## Siguiente Paso Nativo

Despues del primer development build funcionando:

1. Crear pantalla de permisos en React Native.
2. Implementar `VpnService` Kotlin.
3. Conectar el toggle del escudo con el modulo nativo.
4. Implementar Accessibility Service para apps bloqueadas.
5. Probar permisos en Pixel 9.

## Despues De Instalar Dependencias Nativas

Si se instala una dependencia nativa nueva, por ejemplo `expo-intent-launcher`, la app instalada debe reconstruirse:

```bash
npm run build:android:dev
```

Los cambios solo JavaScript cargan con `npm run dev-client`; las dependencias nativas requieren APK nuevo.
Si Metro no carga en el telefono, prueba `npm run dev-client:tunnel` antes de reconstruir el APK.
