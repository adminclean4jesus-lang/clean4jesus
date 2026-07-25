# Matriz QA iPhone

| Área | Prueba | Resultado requerido |
| --- | --- | --- |
| Navegación | Refugio, Palabra, Comunidad y Perfil | Safe Areas, texto y pestañas correctas |
| Cuenta | Correo, recuperación, Google OAuth y cierre de sesión | Deep links vuelven a la app y sesión segura |
| Perfil | Foto, nombre y preferencias | Datos privados no se publican por error |
| Palabra | Planes, progreso, idioma y modo visual | Carga y errores honestos |
| Notificaciones | Permiso y recordatorio | APNs validado en iPhone físico |
| Protección | Family Controls, Shield y límites | Solo con entitlement aprobado |

## Dispositivos mínimos

- iPhone compacto reciente.
- iPhone actual de pantalla estándar.
- iPad si se mantiene `supportsTablet: true`.
- iOS actual y la versión anterior anunciada como soportada.

No se sube TestFlight externo hasta registrar evidencia, responsable y fecha en `config/ios-release-readiness.json`.
