# Declaración de Google Play: borrador operativo

Este documento guía el formulario. Debe verificarse contra el AAB final y el comportamiento real de todos los SDK antes de enviarlo.

## Datos recopilados fuera del dispositivo

| Tipo de dato | Recopilado | Compartido | Finalidad | Opcional |
| --- | --- | --- | --- | --- |
| Correo e identificador de usuario | Sí, con cuenta | Con proveedores de servicio | Gestión de cuenta, seguridad | Sí |
| Nombre y foto | Sí, si se proporciona | Con proveedores; nombre/foto visibles según elección | Perfil y Comunidad | Sí |
| Ciudad y biografía | Sí, opcional | Visibilidad comunitaria elegida | Funciones sociales | Sí |
| Contenido generado por usuario | Sí | Visible en Comunidad y procesado por proveedores | Comunidad y moderación | Sí |
| Reportes y evidencia de moderación | Sí | Proveedores/autoridades si aplica | Seguridad y cumplimiento | No al reportar |
| Tokens y diagnóstico técnico | Sí | Expo/Supabase/Cloudflare | Notificaciones, seguridad y funcionamiento | Según función |
| Señales genéricas de acompañamiento | Sí | Persona de confianza elegida recibe alerta genérica | Funcionalidad de acompañamiento | Sí |

## Datos que no se recopilan en servidor

- historial de navegación;
- URL visitadas;
- búsquedas;
- texto visible detectado;
- mensajes;
- contraseñas de otras aplicaciones;
- PIN del Refugio;
- nombre de la aplicación que originó una alerta de acompañamiento;
- capturas de pantalla;
- racha espiritual o registro de caídas.

## Seguridad y controles

- Cifrado en tránsito: sí.
- Eliminación desde la app: sí.
- Solicitud web de eliminación: requerida antes de publicación.
- Cuenta opcional: sí, para Refugio y Palabra.
- Revisión independiente de seguridad: no declarar hasta realizarla.

## Formularios adicionales

- Declaración de `VpnService`.
- Divulgación de Accesibilidad.
- Target audience: beta de Cuenta y Comunidad 18+.
- UGC: reporte, moderación y normas públicas.
- Child Safety Standards: URL pública y contacto designado.
- App access: credenciales de revisión o flujo documentado.

