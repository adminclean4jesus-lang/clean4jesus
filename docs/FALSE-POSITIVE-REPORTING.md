# Reporte de falsos positivos

## Objetivo

Clean4Jesus puede registrar que una persona considera que una interrupción fue un falso positivo. El reporte se envía únicamente después de que la persona toca `¿Fue un error?` y confirma el PIN. La protección local no se pausa automáticamente y el reporte nunca desbloquea una aplicación.

## Qué se envía

- Hash anónimo estable de la instalación, no el identificador original del dispositivo.
- Paquete de la aplicación que estaba en primer plano.
- Huella técnica de la regla que produjo la interrupción.
- Idioma (`es`, `en`, `fr` o `pt`).
- Versión de Clean4Jesus.
- Fuente fija: `native_interruption`.

## Qué nunca se envía

- Texto buscado, URL, historial, mensajes o capturas.
- Nombre, correo, cuenta de Supabase o PIN.
- Contenido de pantalla.
- Lista de aplicaciones instaladas.

## Flujo técnico

1. La pantalla nativa conserva la aprobación local de 20 segundos.
2. Después del PIN correcto, Android intenta enviar el reporte en segundo plano.
3. La Edge Function `report-false-positive` valida esquema, idioma, paquete, huellas y API pública.
4. La función limita a 10 reportes por instalación y hora.
5. El registro se guarda en `public.false_positive_reports`, con RLS habilitado y permisos de lectura/escritura revocados para `anon` y `authenticated`. Solo el rol de servicio puede operar la tabla desde backend.

## Qué significa “aprender”

Esta primera versión no cambia reglas automáticamente. Los reportes quedan como señales anonimizadas para revisión. La siguiente fase debe incluir una consola de moderación donde una persona pueda agrupar falsos positivos, aprobar una excepción contextual y publicar una nueva versión de reglas. No se debe convertir un reporte aislado en una lista blanca automática.

## Verificación realizada

- Migraciones Supabase aplicadas en el proyecto vinculado.
- Edge Function desplegada.
- Payload inválido rechazado con `400`.
- Payload sintético válido insertado y eliminado después de la prueba.
- Tabla verificada con RLS activo y sin permisos para `anon`/`authenticated`.
- TypeScript validado con `npx tsc --noEmit`.
- Kotlin nativo compilado con `:app:compileDebugKotlin`.

## Próximo paso

Probar en el Pixel 9: generar un falso positivo, confirmar PIN, comprobar que el bloqueo sigue activo, verificar que no se envía contenido sensible y revisar el registro desde un entorno administrativo. No generar APK hasta aprobar esa evidencia.
