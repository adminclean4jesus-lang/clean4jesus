# Internacionalizacion ES / EN / FR / PT-BR

Estado tecnico: cobertura funcional completa al 21 de julio de 2026.

## Arquitectura

- Locales soportados: espanol (`es`), ingles (`en`), frances (`fr`) y portugues brasileno (`pt`).
- `I18nProvider` conserva la eleccion en AsyncStorage y sincroniza el idioma con la capa nativa Android.
- Los textos breves se resuelven mediante catalogos tipados en `src/features/i18n`.
- Los ocho planes, sus 56 lecturas y los siete devocionales diarios usan contenido localizado estructurado.
- Los errores de Auth y sesion cruzan la UI como codigos estables; ningun componente publico muestra mensajes tecnicos de Supabase.
- Android contiene recursos propios en `values`, `values-en`, `values-fr` y `values-pt-rBR` para Accesibilidad y textos del sistema.
- El fallback tecnico es espanol y existe solo para impedir pantallas vacias; no autoriza una publicacion incompleta.

## Cobertura Implementada

- Navegacion, Refugio, Palabra, Comunidad, Mi perfil y Ajustes.
- Onboarding, PIN, permisos, pantalla de interrupcion y proteccion de apps.
- Registro, acceso, Google OAuth, confirmacion, recuperacion y eliminacion de cuenta.
- Persona de confianza, alertas, composicion, comentarios, reportes y moderacion visible al usuario.
- Catalogo, detalle y lectura diaria de los ocho planes devocionales.
- Siete devocionales diarios completos.
- Notificaciones locales y recordatorios de planes.
- Avisos internos de privacidad, terminos y reglas de comunidad.

## Barreras Automaticas

- La suite comprueba paridad estructural del contenido en los cuatro idiomas.
- Todos los codigos de error de Auth y sesion deben tener mensaje en cada idioma.
- Los componentes publicos no pueden imprimir `error.message` ni fallbacks historicos en espanol.
- TypeScript, pruebas unitarias, E2E, export web y compilacion Android forman la puerta de salida.

## Pendiente Editorial Antes De Beta Publica

La implementacion esta lista para QA, pero el contenido no se considera aprobado para publicacion hasta completar:

1. Revision nativa de ingles, frances y portugues brasileno.
2. Revision pastoral y teologica de planes, devocionales y oraciones.
3. Revision legal profesional de privacidad, terminos, edad minima y reglas de comunidad en cada jurisdiccion objetivo.
4. Verificacion de licencia y atribucion de toda traduccion biblica; no publicar texto NTV sin permiso aplicable.
5. Pruebas visuales en Android pequeno, mediano y grande con textos largos en frances y portugues.

La consola de moderacion es una herramienta interna y permanece en espanol por ahora. No forma parte de la experiencia movil publica.
