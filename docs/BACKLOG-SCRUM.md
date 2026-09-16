# Backlog operativo Scrum

Última actualización: 16 de septiembre de 2026 · última versión aprobada en dispositivo `1.3.35`; fuente candidata `1.3.37` (Android 55, iOS 27).

Este archivo es la copia versionada del tablero. Los estados son: **Por hacer**, **En curso**, **En revisión**, **Stopper** y **Hecho**. El tablero externo puede usarse para mover tarjetas, pero este documento conserva el contexto necesario para clonar el proyecto y continuar el trabajo.

## Por hacer

- **Prueba física Android de desinstalación y Accesibilidad** — Mateo Vidal (QA), con Camila Duarte. Confirmar que la ausencia de check-in después de 30 minutos genera un aviso genérico, sin prometer bloqueo del sistema.
- **Matriz de release Android** — Probar la APK candidata `1.3.37 (55)` en Pixel y un segundo fabricante; incluir DNS-over-TLS en Wi-Fi/datos, fallo del upstream, firma debug, permisos, WhatsApp OFF/ON, desbloqueo de 15 minutos y análisis visible durante ese desbloqueo.
- **Beta cerrada y requisitos legales de tiendas** — Elena Ríos (Producto), con Irene Salazar y Gabriel Herrera (Editorial).

## En curso

- **Operación de TestFlight iOS** — Confirmar procesamiento y testers de `1.3.35 (25)` en App Store Connect. La candidata `1.3.37 (27)` requiere PR, compilación y QA físico de PIN, selección y estado.
- **Correo de modo acompañado** — El código ya envía HTML y texto, pero aún hay que confirmar Resend, dominio remitente, cron y entrega real a un destinatario de prueba con consentimiento.

## En revisión

- **Reporte “Uso de hoy” iOS** — Sofía Beltrán (Diseño), con Mateo Vidal. La extensión funciona, pero el diseño y los estados vacíos deben revisarse en hardware; iOS puede entregar datos con retraso.
- **Claims de landing y privacidad** — Nicolás Vega (Growth), con Irene Salazar. Mantener diferencias Android/iOS y no prometer bloqueo absoluto, contador en tiempo real o protección contra desinstalación.

## Stopper

- **NO-GO para beta externa**: faltan QA Android real en dos fabricantes, compilación/QA iOS de `27`, correo real de modo acompañado, eliminación con CAPTCHA real, firma release Android, revisión legal y declaraciones de tiendas. `npm audit --omit=dev` registra 16 alertas altas y 18 moderadas; requieren una actualización y regresión nativa separadas. DNS-over-TLS ya está implementado y compilado, pero aún exige evidencia física en Wi-Fi, datos y fallo de upstream.

## Hecho

- **Checkpoint iOS `1.3.35 (25)`** — Family Controls, límites independientes, Shield de marca y `DeviceActivityReport` empaquetado como ExtensionKit.
- **Checkpoint Android `1.3.35 (53)`** — WhatsApp/WhatsApp Business excluidos por defecto; opt-in con disclaimer y retirada protegida por PIN. El repositorio clonado no incluía los artefactos `current/previous`, que son locales y están ignorados por Git.
- **Supabase de producción endurecido** — Historial reconciliado; migraciones `20260830120000`, `20260913120000` y `20260913130000` aplicadas; funciones `report-false-positive`, `accountability`, `accountability-health` y `delete-account` desplegadas. Suites remotas positiva y negativa aprobadas.
- **APK candidata Android `1.3.37 (55)`** — Compilada con Gradle local, lint nativo aprobado, universal y firmada solo para QA debug. Incluye DNS-over-TLS y eliminación compatible con CAPTCHA. No implica QA físico ni permiso de beta externa.
- **Identidad del Shield y reporte** — logo oficial navy/blanco de Clean4Jesus, sin reloj de arena ni copy de respiración.
- **Documentación de versión y operación** — README, historial y comandos de build alineados con los artefactos actuales.

## Dependencias de la persona propietaria del proyecto

- Conectar y autorizar un Android de prueba por USB; aportar otro fabricante para la matriz y autorizar una desinstalación solo en un dispositivo/cuenta de QA.
- Confirmar los dos cron de Supabase y realizar las pruebas consentidas de correo y eliminación con CAPTCHA real.
- Confirmar TestFlight en App Store Connect y facilitar un iPhone para `1.3.37 (27)`.
- Confirmar dominio remitente de Resend y un destinatario de prueba consentido.
- Aprobar con asesoría legal el copy de beta, privacidad, comunidad, permisos y fichas antes de invitar usuarios externos.
