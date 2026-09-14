# Backlog operativo Scrum

Última actualización: 13 de septiembre de 2026 · última versión distribuida `1.3.35`; fuente candidata `1.3.36` (Android 54, iOS 26).

Este archivo es la copia versionada del tablero. Los estados son: **Por hacer**, **En curso**, **En revisión**, **Stopper** y **Hecho**. El tablero externo puede usarse para mover tarjetas, pero este documento conserva el contexto necesario para clonar el proyecto y continuar el trabajo.

## Por hacer

- **Prueba física Android de desinstalación y Accesibilidad** — Mateo Vidal (QA), con Camila Duarte. Confirmar que la ausencia de check-in después de 30 minutos genera un aviso genérico, sin prometer bloqueo del sistema.
- **Matriz de release Android** — Repetir la APK candidata `1.3.36 (54)` en Pixel y un segundo fabricante; documentar firma debug, permisos, WhatsApp OFF/ON, desbloqueo de 15 minutos y análisis de contenido durante ese desbloqueo.
- **Beta cerrada y requisitos legales de tiendas** — Elena Ríos (Producto), con Irene Salazar y Gabriel Herrera (Editorial).

## En curso

- **Desplegar endurecimientos de seguridad** — Aplicar migraciones `20260830120000`, `20260913120000` y `20260913130000`, desplegar `report-false-positive`, `accountability` y `accountability-health` y hacer pruebas negativas remotas. La última migración repara la retención de reportes y eventos. La fuente local está lista; el servidor no se ha cambiado.
- **Operación de TestFlight iOS** — Confirmar procesamiento y testers de `1.3.35 (25)` en App Store Connect. La candidata `1.3.36 (26)` requiere nuevo PR, compile y QA físico de PIN, selección y estado.
- **Correo de modo acompañado** — El código ya envía HTML y texto, pero aún hay que confirmar Resend, dominio remitente, cron y entrega real a un destinatario de prueba con consentimiento.

## En revisión

- **Reporte “Uso de hoy” iOS** — Sofía Beltrán (Diseño), con Mateo Vidal. La extensión funciona, pero el diseño y los estados vacíos deben revisarse en hardware; iOS puede entregar datos con retraso.
- **Claims de landing y privacidad** — Nicolás Vega (Growth), con Irene Salazar. Mantener diferencias Android/iOS y no prometer bloqueo absoluto, contador en tiempo real o protección contra desinstalación.

## Stopper

- **NO-GO para beta externa**: faltan prueba Android real y segundo fabricante, compile/QA iOS de `26`, migraciones y funciones desplegadas, correo real, firma release Android, revisión legal y declaraciones de tiendas. `npm audit --omit=dev` aún registra 16 alertas altas y 22 moderadas; requieren triaje y actualización/regresión nativa separada. La VPN Android aún dirige DNS por UDP/53 y no demuestra cobertura de DNS cifrado propio de terceros.

## Hecho

- **Checkpoint iOS `1.3.35 (25)`** — Family Controls, límites independientes, Shield de marca y `DeviceActivityReport` empaquetado como ExtensionKit.
- **Checkpoint Android `1.3.35 (53)`** — WhatsApp/WhatsApp Business excluidos por defecto; opt-in con disclaimer y retirada protegida por PIN. El repositorio clonado no incluía los artefactos `current/previous`, que son locales y están ignorados por Git.
- **APK candidata Android `1.3.36 (54)`** — Compilada con Gradle local, lint nativo aprobado, universal y firmada solo para QA debug; guardada en `artifacts/apk/current`, con `1.3.35 (53)` en `previous`. No implica QA físico ni permiso de beta externa.
- **Identidad del Shield y reporte** — logo oficial navy/blanco de Clean4Jesus, sin reloj de arena ni copy de respiración.
- **Documentación de versión y operación** — README, historial y comandos de build alineados con los artefactos actuales.

## Dependencias de la persona propietaria del proyecto

- Conectar y autorizar un Android de prueba por USB; aportar otro fabricante para la matriz y autorizar una desinstalación solo en un dispositivo/cuenta de QA.
- Iniciar sesión de Supabase en este PC o ejecutar el runbook de despliegue; guardar credenciales localmente, nunca en Git ni en el chat.
- Confirmar TestFlight en App Store Connect y facilitar un iPhone para `1.3.36 (26)`.
- Confirmar dominio remitente de Resend y un destinatario de prueba consentido.
- Aprobar con asesoría legal el copy de beta, privacidad, comunidad, permisos y fichas antes de invitar usuarios externos.
