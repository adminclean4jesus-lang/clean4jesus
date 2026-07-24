# Retención y Eliminación de Datos

**Versión operativa:** 1.0  
**Propietario del proceso:** Seguridad y Privacidad  
**Revisión:** trimestral

| Categoría | Ubicación | Retención normal | Eliminación |
| --- | --- | --- | --- |
| PIN, reglas, historial funcional y progreso | Dispositivo | Hasta borrado de datos o desinstalación | Local, por Android o controles de la app |
| Imagen/frase de interrupción | Dispositivo | Hasta reemplazo o borrado | Desde Ajustes o borrando datos |
| Cuenta y perfil | Supabase | Mientras la cuenta esté activa | Desde Mi perfil o solicitud web |
| Publicaciones, comentarios y oraciones | Supabase | Mientras la cuenta esté activa | Con cuenta; puede quedar evidencia de moderación |
| Tokens push | Supabase/Expo | Mientras el dispositivo o vínculo esté activo | Al cerrar sesión, revocar o eliminar cuenta |
| Relación de confianza | Supabase privado | Hasta revocación o eliminación | Revocación bilateral y borrado de cuenta |
| Señales genéricas de riesgo | Supabase privado | 24 horas | Purga automática |
| Despachos técnicos de alertas | Supabase privado | 30 días | Purga automática |
| Falsos positivos | Supabase privado | 12 meses | Purga programada o solicitud compatible |
| Moderación y auditoría | Supabase privado | 24 meses | Purga programada; excepción por investigación |
| Logs mínimos de eliminación/seguridad | Infraestructura | 24 meses | Purga restringida |
| Catálogo editorial | Supabase | Mientras esté publicado o archivado | Flujo editorial versionado |

## Principios

1. Minimización: no recopilar texto visible, URL, búsquedas o mensajes.
2. Separación: protección local no se mezcla con identidad comunitaria.
3. Acceso mínimo: moderación privada con MFA y auditoría.
4. Borrado verificable: la función de eliminación debe devolver confirmación.
5. Retención excepcional: solo por investigación, disputa u obligación legal documentada.

## Automatización vigente

- Supabase ejecuta diariamente `private.purge_expired_privacy_data()`.
- Los reportes privados de falsos positivos se purgan al cumplir 12 meses.
- La auditoría y los casos cerrados de moderación se purgan al cumplir 24 meses, salvo una retención excepcional documentada.
- El consentimiento legal es versionado, auditable y no puede editarse desde el cliente.

## Controles operativos pendientes de ejecución periódica

- Revisar trimestralmente los plazos y el resultado del job de retención.
- Confirmar la política de backups disponible en el plan contratado de Supabase.
- Repetir antes de cada release mayor la prueba de eliminación de cuenta, tokens, vínculos y contenido con una cuenta de QA.
