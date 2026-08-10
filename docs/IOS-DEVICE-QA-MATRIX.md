# Matriz QA iPhone

| Área | Prueba | Resultado requerido |
| --- | --- | --- |
| Navegación | Refugio, Palabra, Comunidad y Perfil | Safe Areas, texto y pestañas correctas |
| Cuenta | Correo, recuperación, Google OAuth y cierre de sesión | Deep links vuelven a la app y sesión segura |
| Perfil | Foto, nombre y preferencias | Datos privados no se publican por error |
| Palabra | Planes, progreso, idioma y modo visual | Carga y errores honestos |
| Notificaciones | Permiso y recordatorio | APNs validado en iPhone físico |
| Protección | Family Controls, Shield y límites | Solo con entitlement aprobado |
| Filtro web | Safari, Chrome y otro navegador instalado | Registrar qué bloquea Apple; no asumir cobertura universal |
| Umbral | Selección de prueba con límite de 1-3 minutos | Device Activity activa el Shield una sola vez y persiste |
| Rescate | Botón principal del Shield | iOS 18+ abre Clean4Jesus y el rescate; fallback seguro en versiones anteriores |
| PIN | Activar, cambiar o pausar el límite | Cinco intentos, lockout y ninguna mutación sin PIN válido |
| Revocación | Retirar permiso de Tiempo en Pantalla | UI deja de afirmar protección y guía para recuperar permiso |
| Reinicio | Reiniciar iPhone con Refugio activo | Filtro, horario y estado se restauran sin exponer datos |
| Regresión | Comunidad, Palabra, Planes, Auth, tema e idiomas | Igual comportamiento que el checkpoint compartido |

## Dispositivos mínimos

- iPhone compacto reciente.
- iPhone actual de pantalla estándar.
- iPad solo si en el futuro cambia `supportsTablet` a `true`.
- iOS actual y la versión anterior anunciada como soportada.

No se sube TestFlight externo hasta registrar evidencia, responsable y fecha en `config/ios-release-readiness.json`.
