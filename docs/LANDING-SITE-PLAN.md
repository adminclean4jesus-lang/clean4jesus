# Landing Oficial De Clean4Jesus

Fecha: 2026-07-25

## Objetivo

`clean4jesus.com` sera la presencia publica oficial del producto. Su trabajo es explicar con claridad que hace Clean4Jesus, establecer confianza y permitir que una persona solicite acceso a la beta. No reemplaza a la aplicacion ni promete una descarga que todavia no existe.

## Mensaje

"Tu atencion no tiene que pelear sola." La landing presenta tres pilares: Refugio, Palabra y Comunidad. El tono es humano, cristocentrico y sereno; evita vergüenza, afirmaciones de cura o promesas de bloqueo perfecto.

## Evidencia Publica

Las afirmaciones publicas se limitan a datos citados y revisables:

- Ofcom (2023): edad promedio de primera exposicion a pornografia online de 13 anos; el informe citado incluye exposicion antes de los 11 anos. Fuente: <https://www.ofcom.org.uk/online-safety/protecting-children/implementing-the-online-safety-act-protecting-children>.
- eSafety Commissioner: 39.1% de adolescentes encuestados reporto su primera exposicion online antes de los 13 anos. Fuente: <https://www.esafety.gov.au/research/adolescent-encounters-with-online-pornography>.
- Griffiths (2024): revision sistematica sobre uso problematico y salud mental. La landing describe asociaciones, nunca causalidad individual o diagnosticos. DOI: <https://doi.org/10.1080/26929953.2024.2348624>.

Antes de una campana pagada, Growth y Legal revisan fecha, metodologia, contexto geográfico y copy de cada afirmacion.

## Descarga Y QR

No se publica un QR de descarga hasta contar con URLs reales y aprobadas de Google Play y App Store. Mientras tanto el CTA abre el correo publico `soporte@clean4jesus.com` para solicitar acceso beta. Esto evita enviar personas a un enlace inexistente o presentar una beta interna como producto publico.

## Operacion Tecnica

- Constructor estatico: `scripts/build-landing-site.mjs`.
- Salida generada: `web/landing/`.
- Configuracion Cloudflare: `wrangler.landing.jsonc`.
- Validacion local: `npm run landing:build`.
- Despliegue manual, solo con aprobacion del CEO: `npm run landing:deploy`.

## Antes De Publicar

1. Aprobar copy y evidencia.
2. Definir destino real del CTA beta (formulario o CRM) y su politica de retencion.
3. Disponer URL real de la beta o tiendas para habilitar QR.
4. Autorizar explicitamente el despliegue a `clean4jesus.com`.
