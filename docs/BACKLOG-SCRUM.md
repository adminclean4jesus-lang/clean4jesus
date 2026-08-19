# Backlog operativo Scrum

Última actualización: 19 de agosto de 2026 · versión de referencia `1.3.35`.

Este archivo es la copia versionada del tablero. Los estados son: **Por hacer**, **En curso**, **En revisión**, **Stopper** y **Hecho**. El tablero externo puede usarse para mover tarjetas, pero este documento conserva el contexto necesario para clonar el proyecto y continuar el trabajo.

## Por hacer

- **Blindar cambios sensibles de iOS por deep link** — Samuel Ortega (Tech Lead), con Mateo Vidal (QA). Exigir PIN o ticket efímero antes de editar límites o selección desde cualquier URL.
- **Cerrar seguridad del modo acompañado** — Irene Salazar (Trust & Safety), con Camila Duarte (Operaciones). Añadir rate limit durable al endpoint de falsos positivos, revisar secretos y publicar el cron de salud.
- **Prueba física Android de desinstalación y Accesibilidad** — Mateo Vidal (QA), con Camila Duarte. Confirmar que la ausencia de check-in después de 30 minutos genera un aviso genérico, sin prometer bloqueo del sistema.
- **Matriz de release Android** — Camila Duarte, con Mateo Vidal. Repetir la APK `1.3.35 (53)` en dos dispositivos y documentar firma, permisos, WhatsApp OFF/ON y regresiones.
- **Beta cerrada y requisitos legales de tiendas** — Elena Ríos (Producto), con Irene Salazar y Gabriel Herrera (Editorial).

## En curso

- **Operación de TestFlight iOS** — Camila Duarte. Build `1.3.35 (25)` enviada a App Store Connect; falta comprobar procesamiento final y testers internos.
- **Correo de modo acompañado** — Camila Duarte, con Samuel Ortega. Plantilla Clean4Jesus lista en la Edge Function; falta verificar entrega real con Resend y el dominio remitente.

## En revisión

- **Reporte “Uso de hoy” iOS** — Sofía Beltrán (Diseño), con Mateo Vidal. La extensión funciona, pero el diseño y los estados vacíos deben revisarse en hardware; iOS puede entregar datos con retraso.
- **Claims de landing y privacidad** — Nicolás Vega (Growth), con Irene Salazar. Mantener diferencias Android/iOS y no prometer bloqueo absoluto, contador en tiempo real o protección contra desinstalación.

## Stopper

- **Ninguno técnico declarado para el checkpoint `1.3.35`**. La beta pública sigue bloqueada hasta completar pruebas físicas, operación de correo y revisión legal de tiendas.

## Hecho

- **Checkpoint iOS `1.3.35 (25)`** — Family Controls, límites independientes, Shield de marca y `DeviceActivityReport` empaquetado como ExtensionKit.
- **APK Android `1.3.35 (53)`** — WhatsApp/WhatsApp Business excluidos por defecto; opt-in con disclaimer y PIN; artefactos current/previous rotados.
- **Identidad del Shield y reporte** — logo oficial navy/blanco de Clean4Jesus, sin reloj de arena ni copy de respiración.
- **Documentación de versión y operación** — README, historial y comandos de build alineados con los artefactos actuales.

## Dependencias de la persona propietaria del proyecto

- Confirmar testers internos de TestFlight y aceptar la invitación de Apple.
- Probar la APK en un segundo Android y registrar resultados de WhatsApp, Accesibilidad y ausencia de check-in.
- Confirmar dominio remitente de Resend y destinatario de prueba para el correo de modo acompañado.
- Aprobar copy legal de beta, privacidad, comunidad y permisos antes de invitar usuarios externos.
