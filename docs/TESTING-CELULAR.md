# Testing En Celular

Guia practica para probar Clean4Jesus en un telefono real.

## Camino recomendado ahora: Expo Go

Usar Expo Go sirve para probar UI, navegacion, habitos, devocional, login mock o Supabase, y flujo general. No sirve para probar modulos nativos propios como VPN Android o Accessibility Service.

## Android con Expo Go

1. Instala **Expo Go** desde Google Play.
2. Abre Google Play y actualiza Expo Go si aparece el boton **Actualizar**.
3. El proyecto esta ajustado a Expo SDK 54 porque tu celular descarga Expo Go 54.0.8.
4. Conecta el PC y el celular a la misma red Wi-Fi.
5. En el PC abre una terminal normal, no desde el panel interno del agente.
6. Ejecuta:

```bash
cd C:\Users\maite\OneDrive\Escritorio\BlockerXChrist\clean4jesus
npm run phone
```

7. Cuando salga el QR, abre Expo Go y escanea el QR.
8. Si no conecta, usa:

```bash
npm run phone:tunnel
```

Tunnel es mas lento, pero funciona mejor si el router bloquea conexiones locales.

## Error: incompatible SDK version

El proyecto esta en Expo SDK 54 para coincidir con Expo Go 54.0.8.

Soluciones en orden:

1. Actualizar Expo Go desde Google Play/App Store.
2. Cerrar Expo Go completamente y volver a escanear.
3. Ejecutar:

```bash
npm run phone:tunnel
```

4. Si aun asi falla, usar un development build Android. Ese camino instala una app propia de Clean4Jesus y no depende de Expo Go.

## iPhone

1. Instala Expo Go desde App Store.
2. Usa el mismo comando:

```bash
npm run phone
```

3. Escanea el QR con la camara o desde Expo Go.

Nota: para builds nativas iOS reales en dispositivo fisico normalmente se necesita cuenta Apple Developer. Para Expo Go no.

## Cuando toque probar bloqueo real

El escudo DNS/VPN y Accessibility Service no se pueden validar en Expo Go. Para eso se necesita:

1. `expo-dev-client`
2. Development build Android con EAS
3. Modulo nativo Android en `/android`
4. Pruebas en APK instalado

Comandos aproximados para esa fase:

```bash
npm run build:android:dev
npm run dev-client
```

## Development Build / APK En Android

Usar este camino para probar Clean4Jesus como app propia en tu Google Pixel 9.

1. Crea o inicia sesion en Expo/EAS:

```bash
npm run eas:login
```

2. Genera un APK de desarrollo:

```bash
npm run build:android:dev
```

3. Cuando EAS termine, abre el enlace que te muestra la terminal desde tu Pixel 9 y descarga el APK.
4. Android puede pedir permiso para instalar apps desconocidas. Acepta solo para esta instalacion.
5. Abre **Clean4Jesus** instalada, no Expo Go.
6. En el PC, inicia Metro para development build:

```bash
npm run dev-client
```

7. Si la app no conecta al PC, usa el menu de desarrollo y cambia la URL al servidor que muestra Metro, o prueba con la misma red Wi-Fi.
8. Si la red local falla, usa:

```bash
npm run dev-client:tunnel
```

9. Si estas por USB, usa:

```bash
adb reverse tcp:8081 tcp:8081
```

Para un APK sin herramientas de desarrollo internas:

```bash
npm run build:android:preview
```

Ese APK sirve para probar una version mas cercana a usuario final.

## Checklist De Prueba Manual

- La app abre sin quedarse en spinner.
- Tabs: Escudo, Devocional, Habitos cargan.
- Activar escudo pide PIN si no existe.
- Crear PIN funciona.
- Activar escudo cambia el estado visual.
- Devocional permite marcar como leido.
- Habitos permiten marcar/desmarcar.
- La app no muestra caracteres raros.
- El diseno se ve bien en pantalla pequena.

## Si No Conecta

- Confirmar que PC y celular estan en la misma Wi-Fi.
- Desactivar VPN del PC/celular temporalmente.
- Permitir Node/Expo en Firewall de Windows.
- Probar `npm run phone:tunnel`.
- Probar `npm run dev-client:tunnel` si es development build.
- Cerrar Expo Go y volver a escanear.
