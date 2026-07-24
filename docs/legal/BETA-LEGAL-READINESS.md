# Clean4Jesus: preparación legal para beta

**Corte:** 23 de julio de 2026  
**Responsable inicial:** Emmanuel López, persona natural  
**Operación inicial:** Colombia, con expansión internacional sujeta a revisión territorial  

Este checklist registra preparación técnica y documental. No reemplaza el concepto de un abogado habilitado ni la aprobación de Google Play o Apple.

## Base cerrada

| Frente | Estado | Evidencia |
| --- | --- | --- |
| Aviso de privacidad | Listo y publicado | `https://legal.clean4jesus.com/privacidad/` |
| Términos de uso | Listo y publicado | `https://legal.clean4jesus.com/terminos/` |
| Reglas de Comunidad | Listo y publicado | `https://legal.clean4jesus.com/comunidad/` |
| Seguridad infantil | Listo y publicado | `https://legal.clean4jesus.com/seguridad-infantil/` |
| Eliminación de cuenta | Listo y publicado | `https://legal.clean4jesus.com/eliminar-cuenta/` |
| Soporte | Listo y publicado | `https://legal.clean4jesus.com/soporte/` |
| Consentimiento versionado | Desplegado | `public.legal_consents`, RPC y control de reaceptación |
| Retención y purga | Desplegado | Job diario; falsos positivos 12 meses y auditoría 24 meses |
| Solicitudes de privacidad | Procedimiento definido | `PRIVACY-REQUESTS-PROCEDURE.md` |
| VPN y Accesibilidad | Divulgación preparada | `ACCESSIBILITY-VPN-DISCLOSURE.md` |
| Data Safety | Inventario preparado | `GOOGLE-PLAY-DATA-SAFETY.md` |
| Crisis y moderación | Procedimientos definidos | Reglas, protocolo interno, MFA y auditoría |

## Decisiones vigentes

- Refugio y Palabra pueden funcionar sin cuenta.
- Cuenta y Comunidad se mantienen restringidas a mayores de 18 años durante la beta.
- El historial, las URL, las búsquedas, los mensajes, el texto detectado y el PIN no se envían al servidor.
- La expansión a menores requiere un producto específico: clasificación de edad, consentimiento aplicable, moderación reforzada y revisión jurídica.
- La base jurídica parte de Colombia. Cada país de lanzamiento puede exigir avisos, representación, derechos o restricciones adicionales.

## Puertas externas antes de beta pública

1. Mantener atendidas las direcciones `soporte@clean4jesus.com`, `privacidad@clean4jesus.com` y `seguridad@clean4jesus.com`, actualmente reenviadas por Cloudflare Email Routing a `adminclean4jesus@gmail.com`; falta documentar filtros, 2FA y pruebas periódicas.
2. Obtener revisión jurídica colombiana de las versiones 1.0/1.1 y documentar ajustes.
3. Confirmar licencias de contenido bíblico, especialmente NTV, para uso y distribución digital.
4. Completar en Play Console Data Safety, Target Audience, UGC, Child Safety, VpnService, Accessibility y Account Deletion usando los documentos vigentes.
5. Ejecutar una prueba QA de eliminación de cuenta y conservar evidencia del resultado.
6. Revisar cada nuevo SDK contra el inventario de datos antes de incorporarlo.

## Veredicto

**Base técnica y documental: GO para iniciar iOS y preparar una beta cerrada.**  
**Publicación abierta y publicidad: NO-GO** hasta cerrar las seis puertas externas anteriores.
