# Preparación de App Store y TestFlight

Actualizado: 13 de septiembre de 2026. Este documento guía a la persona titular; las respuestas legales, de privacidad y clasificación se confirman en App Store Connect.

## Estado verificable

- `1.3.35 (25)` es la última IPA que el historial registra como enviada a App Store Connect. Procesamiento final, disponibilidad en TestFlight y testers no verificados en esta sesión.
- `1.3.36 (26)` es solo una candidata de fuente. No afirmar que está en TestFlight hasta obtener artifact firmado, subida y prueba en iPhone.
- La app principal y `DeviceActivityMonitor`, `ShieldConfiguration`, `ShieldAction` y `DeviceActivityReport` requieren provisioning y Family Controls Distribution donde corresponda. Ver `IOS-APPLE-HANDOFF.md`.

## Ficha propuesta para revisión

| Campo | Propuesta |
| --- | --- |
| Nombre | Clean4Jesus |
| Bundle ID | `com.clean4jesus.app` |
| Categoría sugerida | Lifestyle; revisar clasificación final en App Store Connect |
| Soporte | `https://legal.clean4jesus.com/soporte/` |
| Privacidad | `https://legal.clean4jesus.com/privacidad/` |
| Términos | `https://legal.clean4jesus.com/terminos/` |
| Idiomas | ES, EN, FR, PT-BR; traducción editorial pendiente de aprobación humana |

Texto base en español: “Clean4Jesus reúne protección local del dispositivo mediante las capacidades de Screen Time permitidas por Apple, devocionales y una comunidad moderada para acompañar decisiones personales. Las apps elegidas y su tiempo de uso permanecen bajo el control privado de Apple en el dispositivo. La protección no garantiza bloqueo total ni reemplaza apoyo profesional o pastoral.”

Revisar con Producto, Privacidad y Legal antes de publicarlo. La propuesta histórica para los otros idiomas está en `archive/2026-07/IOS-APP-STORE-PREPARATION.md`; no copiarla a la ficha sin revisión.

## Mapa de privacidad para el formulario

| Dato | Flujo que se debe declarar y verificar |
| --- | --- |
| Correo y cuenta | Supabase Auth para registro, confirmación y recuperación. |
| Perfil y contenido de Comunidad | Se envían solo si la persona los crea/publica; moderación y retención según avisos vigentes. |
| Metadatos del modo acompañado | Consentimiento bilateral; señales y avisos genéricos, sin contenido de navegación. |
| Falsos positivos | Hash de instalación, paquete, huella de regla, idioma y versión tras PIN; sin texto, URL, PIN ni capturas. |
| Selección y uso de Screen Time | Tokens y duración quedan en el dispositivo y en las extensiones Apple; no exportarlos a React Native ni al backend. |

Antes de enviar: confirmar cuestionario de privacidad y edad, URLs, cuenta de soporte, eliminación de cuenta, licencias de contenido, capturas reales sin datos sensibles y metadatos localizados. Conservar la respuesta final de Apple como evidencia.

## Ronda de TestFlight

1. Confirmar si `1.3.35 (25)` terminó de procesarse y anotar estado, fecha y testers internos.
2. Para la nueva build `1.3.36 (26)`, esperar compilación y firma del PR de iOS; no reutilizar la IPA `25` para validar cambios nuevos.
3. Instalar en iPhone y ejecutar `IOS-DEVICE-QA-MATRIX.md`: arranque, Family Controls, edición con PIN, selección activa, límites independientes, Shield, “Uso de hoy”, permiso revocado, idiomas y offline.
4. Registrar dispositivo, iOS, build, resultado y evidencia sin PIN, nombres de apps privadas ni datos de Comunidad.
