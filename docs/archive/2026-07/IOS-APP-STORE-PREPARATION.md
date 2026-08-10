# Preparacion App Store: Clean4Jesus

Estado: preparado para completar en App Store Connect cuando Apple active la membresia.

## Identidad de la app

| Campo | Valor inicial |
| --- | --- |
| Nombre | Clean4Jesus |
| Bundle ID | `com.clean4jesus.app` |
| Categoria primaria | Lifestyle |
| Categoria secundaria | Health & Fitness |
| Soporte | `https://legal.clean4jesus.com/soporte/` |
| Privacidad | `https://legal.clean4jesus.com/privacidad/` |
| Terminos | `https://legal.clean4jesus.com/terminos/` |
| Idiomas de interfaz | Espanol, ingles, frances, portugues (Brasil) |

## Copy inicial de App Store

### Espanol

**Subtitulo**
Proteccion digital, palabra y comunidad.

**Descripcion corta**
Clean4Jesus une herramientas de proteccion digital, devocionales guiados y una comunidad moderada para ayudar a caminar con mas libertad y acompanamiento.

**Descripcion**
Clean4Jesus es un espacio de apoyo para fortalecer decisiones digitales y espirituales. Incluye Refugio para configurar capas de proteccion en el dispositivo, Palabra con devocionales y planes guiados, y Comunidad para compartir testimonios, peticiones y acompanamiento.

Tu correo no aparece en el feed. Las decisiones de proteccion y el contenido sensible se manejan con cuidado y transparencia. Clean4Jesus no reemplaza atencion clinica, pastoral o profesional cuando la necesites.

### English

**Subtitle**
Digital protection, devotion, and community.

**Short description**
Clean4Jesus brings together digital protection tools, guided devotionals, and a moderated community to help people walk with greater freedom and support.

### French

**Subtitle**
Protection numerique, devotion et communaute.

### Portuguese (Brazil)

**Subtitle**
Protecao digital, devocional e comunidade.

## Material pendiente de producto

- Icono de App Store de 1024 x 1024 sin transparencia.
- Entre cinco y diez capturas reales de iPhone por idioma prioritario.
- Politica de privacidad y soporte ya publicados; revisar enlaces en App Store Connect antes de enviar.
- Decision de edad y clasificacion completada por el titular en App Store Connect.

## Mapa inicial de privacidad para App Store Connect

Este mapa sirve para completar el cuestionario, no sustituye sus preguntas finales.

| Area | Estado esperado | Nota |
| --- | --- | --- |
| Correo y credenciales | Recolectados para cuenta | Gestionados por Supabase Auth; no se muestran en Comunidad. |
| Perfil publico opcional | Recolectado si el usuario lo crea | Nombre visible, ciudad y biografia opcional. |
| Publicaciones y comentarios | Recolectados si el usuario los publica | Necesarios para Comunidad y moderacion. |
| Diagnostico de falsos positivos | Datos tecnicos minimos | Sin texto, URL, mensajes, busquedas ni PIN. |
| Contenido de bloqueo | No enviado por el motor de proteccion | Se procesa localmente en Android; iOS se definira bajo permisos Apple. |
| Foto de interrupcion | Local | No se sube a Comunidad ni Supabase. |

## TestFlight: primera ronda

1. Instalar desde TestFlight en iPhone fisico.
2. Verificar registro por correo, confirmacion, recuperacion y Google OAuth iOS.
3. Verificar idioma, tema, Palabra, Planes, Perfil y Comunidad.
4. Verificar permiso de notificaciones y entrega de una notificacion de prueba.
5. Con Family Controls aprobado, verificar seleccion de apps, Shield y regreso seguro sin afirmar capacidades no disponibles.
6. Reportar cada fallo con modelo de iPhone, version de iOS, idioma, pasos y captura sin datos sensibles.

## Lo que sigue bloqueado por Apple

- Crear la ficha real de App Store Connect.
- Firmar builds y subir TestFlight.
- Habilitar APNs.
- Solicitar Family Controls y crear App Group.
- Construir y firmar extensiones Swift en macOS/Xcode.
