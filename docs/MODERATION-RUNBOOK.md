# Operacion De Moderacion

Documento interno. No se muestra dentro de la app.

## Principios

- Proteger a las personas antes que las metricas.
- No exponer la identidad de quien reporta.
- Aplicar la accion minima necesaria y dejar una nota concreta.
- No usar acceso administrativo para leer informacion fuera de la cola.
- Toda accion queda en `private.community_moderation_actions` y no puede editarse ni borrarse.

## Roles

- `moderator`: revisa reportes, reclama casos, oculta contenido y resuelve sin accion.
- `admin`: tiene las mismas acciones, puede administrar el equipo y es el unico rol que puede restaurar contenido.
- Restaurar contenido exige una sesion con MFA (`aal2`), incluso para administradores.
- El APK nunca contiene una clave administrativa ni permite asignar roles.

## Alta Inicial

1. Crear y confirmar la cuenta del administrador desde el flujo normal.
2. Copiar su UUID desde `Authentication > Users`.
3. Insertar el rol desde SQL Editor con una sesion administrativa:

```sql
insert into private.community_moderators (user_id, role)
values ('UUID_DEL_ADMIN', 'admin');
```

4. No automatizar este paso desde el cliente movil.

## Prioridad

| Nivel | Caso | Objetivo |
| --- | --- | --- |
| P0 | Riesgo inmediato, explotacion, amenaza creible | Escalar de inmediato al protocolo de crisis |
| P1 | Contenido sexual, acoso dirigido, datos personales | Revisar y contener el mismo dia |
| P2 | Spam, lenguaje hostil, contenido fuera de tema | Resolver en 24 horas |

## Acciones

- `hide_content`: oculta el contenido y resuelve el reporte.
- `restore_content`: restaura contenido oculto; requiere rol `admin` y MFA.
- `claim`: asigna el caso al moderador y lo pasa a revision.
- `resolve_no_action`: cierra el reporte sin cambiar el contenido.

Las acciones se ejecutan mediante `moderate-community`; nunca actualizando tablas manualmente salvo recuperacion documentada.
Cada operacion exige la version esperada del caso y una clave de idempotencia para evitar dobles acciones o sobrescrituras concurrentes.

## Seguridad Operativa Pendiente

- Exigir MFA TOTP a cada moderador antes de beta publica.
- Construir una consola interna separada de la experiencia comunitaria normal.
- Revisar semanalmente el volumen, tiempos y reincidencias sin exportar contenido sensible.
