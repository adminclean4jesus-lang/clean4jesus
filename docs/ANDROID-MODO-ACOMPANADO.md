# Modo acompañado para Android

Este modo es voluntario y requiere una relación de persona de confianza aceptada por ambas personas.

## Qué hace

- El teléfono comprueba cada cierto tiempo solamente si Accesibilidad y la protección DNS local están activas.
- Si Clean4Jesus no puede confirmar la protección durante el periodo configurado (por defecto, dos horas), el servidor envía un correo genérico a la persona de confianza.
- La misma ausencia puede ocurrir tras una desinstalación. Android no permite interceptar ni bloquear la desinstalación, por lo que el producto no debe prometer un PIN en el diálogo del sistema.
- No se envían búsquedas, URLs, texto visible, nombres de apps ni contenido.

## Consentimiento y control

1. El dueño solicita el modo desde **Persona de confianza**.
2. La persona de confianza debe aceptarlo de forma explícita.
3. El dueño puede desactivarlo solamente tras validar su PIN en la app.
4. Ambas personas pueden revocar por completo el vínculo desde la app.

## Configuración operativa obligatoria antes de producción

La migración crea el cron, pero requiere estos valores en Supabase:

- Edge Function secrets: `ACCOUNTABILITY_SCHEDULER_SECRET`, `RESEND_API_KEY` y `ACCOUNTABILITY_FROM_EMAIL`.
- Vault secrets: `clean4jesus_project_url` con la URL del proyecto Supabase y `clean4jesus_accountability_scheduler_secret` con el mismo valor aleatorio de `ACCOUNTABILITY_SCHEDULER_SECRET`.
- Un dominio remitente verificado en Resend para `ACCOUNTABILITY_FROM_EMAIL`.

Después, desplegar las funciones `accountability` y `accountability-health`, aplicar la migración y revisar en Supabase Cron que `clean4jesus-accountability-health-dispatch` se ejecute cada 15 minutos.

## Prueba de aceptación

1. Dos cuentas crean y aceptan el vínculo.
2. El dueño solicita el modo; la persona de confianza lo acepta.
3. En Android se comprueba que el primer check-in se registra sin contenido sensible.
4. Se desactiva Accesibilidad o VPN durante el periodo de gracia y se verifica un único correo genérico.
5. Se restaura la protección antes de un nuevo ciclo: no se vuelve a enviar el correo.
6. Se prueba una desinstalación en un dispositivo de prueba; la ausencia de check-ins debe generar el mismo aviso, no una promesa de bloqueo del sistema.
