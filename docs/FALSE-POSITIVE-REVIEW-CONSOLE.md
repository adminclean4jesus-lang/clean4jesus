# Revision humana de falsos positivos

## Proposito

Esta cola permite revisar senales tecnicas que una persona marco como un posible falso positivo despues de ingresar correctamente el PIN. Su objetivo es mejorar futuras reglas de bloqueo sin debilitar el refugio actual.

## Datos que llegan

Cada caso agrupado conserva solamente:

- Paquete de la aplicacion afectada.
- Huella tecnica irreversible de la regla detectada.
- Idioma, version de la app, fecha y numero de senales.

Nunca se conserva texto visible, URL, historial, capturas, mensajes, correo, PIN ni identidad de quien reporta.

## Roles y decisiones

- Un `moderator` con MFA puede reclamar un caso o solicitar evidencia adicional.
- Un `admin` con MFA puede confirmar un falso positivo o mantener el bloqueo.
- Toda decision exige una nota operativa y queda en un registro de auditoria inmutable.

## Regla mas importante

Confirmar un falso positivo **no** cambia una regla en telefonos, no crea una lista blanca y no desbloquea contenido automaticamente. Solo deja una decision trazable para que una futura politica de filtros sea revisada, versionada, probada y publicada por separado.

## Operacion

1. Entra a `moderation.clean4jesus.com` con una cuenta autorizada y MFA.
2. Abre `Falsos positivos`.
3. Reclama el caso o solicita evidencia.
4. Como administrador, registra `Confirmar falso positivo` o `Mantener bloqueo` con motivo.
5. Una futura actualizacion de politica se trata como un cambio de producto separado, con pruebas y aprobacion.
