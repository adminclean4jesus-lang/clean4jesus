# ADR-006: Arquitectura de protección para iOS

- Estado: aceptada para implementación por fases
- Fecha: 2026-07-25
- Responsables: Valentina Cruz (Arquitectura), Samuel Ortega (Tech Lead), Mateo Vidal (Ingeniería móvil y QA)

## Contexto

Android usa `VpnService`, `AccessibilityService` y una `Activity` nativa de interrupción. iOS no proporciona un equivalente de Accesibilidad para inspeccionar texto en otras apps ni permite cerrar procesos de terceros. Copiar esa implementación sería técnicamente falso y riesgoso para App Review.

## Decisión

1. Mantener el motor Android intacto como implementación `android`.
2. Definir una frontera compartida (`protectionPlatform.ts`) que impide declarar protección iOS como activa sin evidencia nativa.
3. Implementar en iOS, con targets Swift separados, las capacidades permitidas por Apple:
   - Family Controls + Managed Settings para escudar apps seleccionadas.
   - Device Activity para límites de tiempo y ejecución programada.
   - Shield Configuration / Shield Action para el flujo de bloqueo permitido por iOS.
   - Network Extension solo si Apple aprueba el entitlement y el caso de uso de DNS/filtro supera revisión.
4. El producto comunica paridad de resultado, no igualdad de APIs: en iOS no se leerán mensajes, texto de pantalla o búsquedas dentro de apps de terceros.

## Consecuencias

- La comunidad, Palabra, Perfil, idioma, modo oscuro, autenticación, personalización local y notificaciones permanecen compartidos con React Native.
- La protección de apps iOS exigirá selección explícita del usuario mediante las APIs de Screen Time; no habrá una blacklist de paquetes Android.
- No se prometerá cierre forzoso de apps. El mecanismo válido es el escudo nativo de Apple.
- El desarrollo y QA de las extensiones exige membresía Apple Developer, entitlement aprobado y dispositivo iPhone físico.

## Alternativas descartadas

- Reutilizar Accessibility de Android: no existe en iOS.
- Mostrar una pantalla React Native sobre otras apps: iOS no lo permite de forma general.
- Simular estado `activo` mientras faltan entitlements: viola confianza y calidad.

## Criterio de salida

Solo se puede marcar `iOS protection ready` cuando existan: entitlement, extensiones firmadas, autorización nativa aprobada, prueba en iPhone real de escudo y límite de tiempo, pruebas de regresión y revisión de privacidad/App Store.

## Implementación candidata 1.3.16

- La app principal guarda selección, idioma y estado en `group.com.clean4jesus.app` y programa un evento diario con `DeviceActivityCenter`.
- `ManagedSettings.WebContentSettings.FilterPolicy.auto` aporta filtrado adulto de Apple. Su cobertura real por navegador se documentará desde pruebas físicas; no se promete inspección de texto ni cobertura universal.
- `Clean4JesusDeviceActivityMonitor` aplica el Shield a los tokens seleccionados cuando se alcanza el umbral y lo limpia al iniciar el siguiente intervalo.
- `Clean4JesusShieldConfiguration` presenta marca y copy local ES/EN/FR/PT sin conocer el nombre de la app o dominio protegido.
- `Clean4JesusShieldAction` registra la intención de rescate en el App Group y cierra la app o navegador protegido. Al abrir Clean4Jesus después, la app consume la intención y presenta el rescate. El rescate no retira el Shield.
- Los targets se regeneran desde `targets/` mediante `@bacons/apple-targets@4.0.7`. Esto conserva CNG, pero exige validar la generación Xcode en macOS/EAS antes de release.
