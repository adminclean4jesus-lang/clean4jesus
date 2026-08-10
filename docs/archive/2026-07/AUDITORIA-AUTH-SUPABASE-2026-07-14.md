# Auditoria De Auth Y Supabase - 2026-07-14

## Veredicto Ejecutivo

La base `1.3.0` era adecuada para prototipo, pero no para usuarios externos. `1.3.1` corrigio los riesgos altos de sesion y minimo privilegio; `1.3.2` agrego moderacion atomica y auditable; `1.3.3` cierra bypasses de recuperacion, reautenticacion, identidad borrada, contenido oculto e idempotencia concurrente. El proyecto Supabase real ya esta conectado y validado; la apertura beta sigue bloqueada por SMTP, CAPTCHA, consola operativa y revision legal.

## Riesgos Corregidos En 1.3.1

| Riesgo | Correccion |
| --- | --- |
| Tokens en AsyncStorage | Sesion en `expo-secure-store`; migracion automatica del valor anterior |
| Flujo de correo incompleto | PKCE, esquema `clean4jesus://`, callback y canje de codigo |
| Cuenta irrecuperable | Solicitud de reset y pantalla para nueva contrasena |
| Sin reenvio de confirmacion | Reenvio controlado desde registro |
| Sesion local no validada | `getUser()` valida la identidad antes de declararla autenticada |
| Usuario podia alterar racha/estado | Grants SQL por columna; racha y moderacion quedan fuera del cliente |
| Spam comunitario ilimitado | Cuotas en triggers Postgres para posts, comentarios y reportes |
| Sin borrado de cuenta | Reautenticacion y Edge Function administrativa solo en servidor |
| Racha expuesta | `clean_streak` deja de estar disponible para el rol autenticado |
| QA RLS solo textual | Script adversarial con dos usuarios y limpieza automatica |

## Arquitectura Objetivo

```text
Expo / React Native
  |-- SecureStore: refresh/access token
  |-- PKCE + deep link: confirmacion y recuperacion
  |-- publishable key: unico acceso desde APK
  v
Supabase Auth ---- Postgres + RLS
  |                    |-- perfil publico minimo
  |                    |-- posts / comentarios / reportes
  |                    `-- cuotas antiabuso
  v
Edge Functions
  `-- operaciones privilegiadas (eliminar cuenta y moderar comunidad)
```

La `service_role` solo existe en Supabase Edge Functions o en una terminal controlada de QA. Nunca entra en Expo, Git o el APK.

## Despliegue Verificado

1. Proyecto `Clean4Jesus` activo en la organizacion `Emmanuel Lopez`, region `us-east-1`.
2. Migraciones `community_v1` y `auth_hardening_v1` aplicadas en remoto.
3. Edge Function `delete-account` activa con JWT obligatorio.
4. Confirmacion de correo, PKCE, minimo de 10 caracteres, cambio seguro y TOTP disponibles.
5. Prueba remota con dos usuarios aprobada, incluida eliminacion real de cuenta.
6. Performance Advisor sin hallazgos; dos advertencias de Security Advisor aceptadas para RPC de moderacion `SECURITY DEFINER`, con rol privado, `auth.uid()` y pruebas negativas.
7. Moderacion desplegada con evidencia durable, acciones idempotentes, control de version y restauracion reservada a administradores con MFA.
8. QA `1.3.3` aprobado con 58 unitarias, 7 E2E, dos suites remotas y `db lint` sin errores de esquema.
9. El borrado exige password y user id dentro de la funcion; una password incorrecta devuelve rechazo y el JWT anterior deja de leer por RLS aunque aun no haya vencido.
10. RLS valida `session_id` contra `auth.sessions`; cerrar una sesion retira acceso de datos sin esperar a que venza el JWT.
11. Moderacion no registra un ocultamiento exitoso si el contenido desaparecio y los residuos de cuota se eliminan junto con la identidad.
12. La RPC de cola valida sesion activa por cuenta propia; un moderador con JWT revocado no puede saltarse la Edge Function e invocarla directamente.

## Riesgos Operativos Registrados

- `npm audit` conserva vulnerabilidades moderadas transitivas. La solucion automatica fuerza Expo SDK 57 y no se mezcla con este parche; requiere una actualizacion de plataforma separada.
- Expo Doctor advierte que algunos campos de `app.json` no se sincronizan automaticamente cuando existe `android/`. Los cambios nativos deben revisarse tambien en Android antes de un build.
- La recuperacion segura debe validarse una vez mas en Android real con un enlace de correo; su fallo seguro es negar el cambio, nunca aceptar una ruta fabricada.

## Bloqueos Antes De Beta

1. Configurar SMTP propio y personalizar correos transaccionales.
2. Activar CAPTCHA en registro y recuperacion.
3. Construir la consola interna que consume la cola de moderacion ya desplegada.
4. Aprobar con asesoria legal la Politica de Privacidad, Terminos, edad minima y protocolo de crisis ya redactados como borradores.

## Siguiente Nivel

- Login con Google y Apple, con credenciales y revision de tiendas.
- MFA TOTP para moderadores y administradores.
- Passkeys cuando el flujo base tenga telemetria y soporte.
- Gestion de dispositivos/sesiones y revocacion remota.
- Observabilidad con errores sanitizados, sin correos, tokens ni contenido comunitario.

## Decision De Producto

No se replica la infraestructura de Meta. Se replica su disciplina: capas pequenas, privilegio minimo, operaciones administrativas fuera del cliente, migraciones inmutables, pruebas adversariales y despliegue gradual.
