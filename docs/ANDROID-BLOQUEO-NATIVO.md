# Bloqueo Nativo Android

Este documento define como Clean4Jesus debe implementar el bloqueo real en Android.

## Verdad Tecnica

Expo Go no puede ejecutar:

- `VpnService`
- `AccessibilityService`
- servicios Android persistentes propios
- overlay/interrupcion encima de otras apps

Para probar bloqueo real se necesita una **development build Android** o APK propio de Clean4Jesus.

## Capas De Proteccion

### 0. Private DNS Android Con Cloudflare Family

Objetivo inmediato: bloquear contenido adulto en navegadores e incognito desde el Pixel 9 mientras se construye el `VpnService` propio.

Configuracion manual en Android:

- Ajustes > Network & internet > Private DNS.
- Elegir **Private DNS provider hostname**.
- Hostname: `family.cloudflare-dns.com`.
- Guardar.

Esto no requiere root y funciona a nivel sistema, pero el usuario puede desactivarlo desde Ajustes. Por eso debe ser una capa temporal/extra, no el producto final.

### 1. DNS Filtering Con VPN Local

Objetivo: bloquear dominios adultos en navegadores, incluido modo incognito.

Implementacion:

- Crear un modulo Android Kotlin con `VpnService`.
- Pedir consentimiento al usuario con el dialogo nativo de Android.
- Redirigir DNS a Cloudflare Family por defecto.
- Mantener estado del escudo sincronizado con React Native.

Lo que si puede hacer:

- Bloquear dominios conocidos de contenido adulto.
- Funcionar en Chrome, navegadores y modo incognito, porque el DNS pasa por la VPN local.

Lo que no debe prometer:

- Leer contenido visual dentro de cada pagina.
- Inyectar una pantalla personalizada dentro de paginas HTTPS bloqueadas.
- Bloquear todo contenido nuevo desconocido si el dominio aun no esta clasificado.

### 2. Bloqueo De Apps Con Accessibility Service

Objetivo: detectar cuando el usuario abre apps bloqueadas y sacar al usuario de ahi.

Implementacion:

- Crear `AccessibilityService` en Android.
- Escuchar eventos de ventana para saber que paquete esta en primer plano.
- Comparar contra blacklist: Chrome, Telegram, TikTok, Instagram, navegadores, etc.
- Si la app esta bloqueada, lanzar una pantalla de interrupcion de Clean4Jesus.

Lo que si puede hacer:

- Detectar apps abiertas.
- Mostrar una pantalla de interrupcion.
- Mandar al usuario a Home o traer Clean4Jesus al frente.
- Pedir PIN para desbloqueo temporal.
- Afectar navegadores, mensajeria y redes sociales cuando exponen texto accesible suficiente para detectar el contenido.

Lo que no debe prometer:

- Forzar cierre real de cualquier app de terceros como si fuera root.
- Controlar apps si el usuario desactiva el permiso de accesibilidad.

### 3. Overlay / Pantalla De Interrupcion

Objetivo: mostrar una pantalla fuerte y personalizada cuando se abre una app bloqueada.

Permisos posibles:

- Accessibility Service para detectar app.
- Display over other apps para overlay si se decide usar ventana flotante.
- Alternativa mas estable: lanzar una Activity full-screen de Clean4Jesus.

Contenido:

- Imagen de fondo elegida por usuario.
- Texto motivacional personalizado.
- Boton "Volver a Clean4Jesus".
- Boton "Ingresar PIN".
- Accion "Cerrar app" se implementa como mandar Home / sacar la app bloqueada del frente, no matar proceso.
- Incluir un mensaje de privacidad claro: Clean4Jesus no sube historial ni lee mensajes; la proteccion ocurre en el dispositivo.

## Paso A Paso Para Usuario

La app debe tener una pantalla de permisos con estos pasos:

1. **Activar escudo DNS**
   - Boton: "Activar VPN de proteccion".
   - Android muestra dialogo de conexion VPN.
   - Usuario toca "Aceptar".

2. **Permitir accesibilidad**
   - Boton: "Abrir ajustes de accesibilidad".
   - Usuario entra a Ajustes.
   - Selecciona Accesibilidad.
   - Selecciona Apps descargadas o Servicios instalados.
   - Selecciona Clean4Jesus.
   - Activa "Usar Clean4Jesus".
   - Si Android muestra el aviso de "Permitir control total del dispositivo", tocar Permitir.
   - Vuelve a Clean4Jesus.

3. **Permitir mostrar sobre otras apps** si usamos overlay.
   - Boton: "Permitir pantalla de interrupcion".
   - Android abre permiso especial.
   - Usuario activa Clean4Jesus.

4. **Evitar que Android mate el servicio**
   - Boton: "Abrir bateria".
   - Usuario selecciona "Sin restricciones" o equivalente.

## UX Esperada

1. Usuario abre Clean4Jesus.
2. Ve una tarjeta simple que explica por que hace falta el permiso de accesibilidad.
3. Cada permiso pasa de pendiente a completado.
4. Cuando todos estan listos, el escudo dice "Proteccion activa".
5. Si intenta abrir una app bloqueada:
   - Clean4Jesus detecta el paquete.
   - Muestra pantalla de interrupcion.
   - Ofrece PIN temporal o salida.

## Disclaimer En La App

La app debe explicar esto con lenguaje sencillo:

- El permiso de accesibilidad ayuda a detectar cuando abres una app bloqueada.
- El aviso de Android es normal y no significa que Clean4Jesus lea tu pantalla completa ni tus mensajes.
- La proteccion trabaja en el dispositivo y no sube tu historial.
- En web o Expo Go no debe mostrarse este aviso automático; solo en Android nativo.

## Orden De Construccion

1. Crear development build Android.
2. Crear onboarding de permisos en React Native.
3. Crear modulo `VpnService` Kotlin.
4. Conectar toggle del escudo con modulo nativo.
5. Crear `AccessibilityService`.
6. Crear lista de apps bloqueadas.
7. Crear pantalla de interrupcion.
8. Agregar PIN temporal.
9. Probar en celular real.

## Estado Actual De Build

- `expo-dev-client` instalado.
- `expo-intent-launcher` instalado para abrir ajustes Android desde la app.
- La app muestra un aviso inicial simple al abrirse para guiar el permiso de accesibilidad.
- Primer `AccessibilityService` nativo agregado:
  - Detecta navegadores comunes.
  - Busca senales textuales riesgosas y hosts conocidos en el arbol de accesibilidad.
  - Hace un intento best-effort de cerrar la navegacion activa con `Back` + `Home`.
  - Abre una pantalla de interrupcion Clean4Jesus.
  - Requiere permiso manual en Ajustes > Accesibilidad > Clean4Jesus.
- Android package: `com.clean4jesus.app`.
- Profiles EAS:
  - `development`: APK con development client para probar modulos nativos.
  - `preview`: APK instalable sin flujo Expo Go.
  - `production`: AAB para Play Store mas adelante.
- Comando para Pixel 9:

```bash
npm run build:android:dev
```

## Limitacion Importante De La Interrupcion

El DNS bloquea dominios, pero no puede insertar una pantalla personalizada dentro de Chrome. La pantalla personalizada depende de Accessibility Service y de que Android/Chrome expongan suficiente texto visible. Por eso:

- Puede detectar busquedas o URLs visibles con senales riesgosas.
- Puede detectar texto adulto en Telegram, TikTok y apps similares cuando el contenido aparece en el arbol de accesibilidad.
- Puede fallar si Chrome no expone el texto o cambia la UI.
- No debe prometer cierre real de Chrome o de otra app de terceros como si fuera root; la accion estable es enviar Home y sacar la app del frente con el servicio de accesibilidad.
- Si la deteccion es demasiado lenta, priorizar texto visible del navegador y el input de busqueda, no solo el contenido completo de la pagina.
- La lista de dominios debe crecer en tandas pequenas y seguir un criterio de mantenimiento, no un volcado indiscriminado imposible de revisar.

