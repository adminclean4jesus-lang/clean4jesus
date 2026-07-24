# Arquitectura De Palabra

Fecha base: 2026-06-30

## Vision

Palabra no debe ser solo una biblioteca de textos. Debe ser una experiencia espiritual contextual para sostener libertad: devocional diario, planes por temporadas, oracion guiada y acciones concretas.

## MVP Actual

- Devocional diario hardcodeado.
- Ocho planes devocionales de maximo siete dias.
- Inscripcion local con AsyncStorage.
- Dias completados por plan.
- Dias pendientes visibles si el usuario se salta una lectura.
- Completar un dia de plan tambien marca lectura devocional del dia.
- Cada dia de plan debe sentirse como lectura de 2-3 minutos: referencia biblica, reflexion pastoral sustanciosa, pregunta, oracion y practica concreta.

## Planes Iniciales

1. Primeros 7 dias limpio.
2. Cuando recai.
3. Ansiedad y soledad.
4. Identidad en Cristo.
5. Pureza digital.
6. Volver a empezar.
7. Fortaleza para la noche.
8. Sanidad de la verguenza.

## Modelo Editorial En Supabase

Implementado el 2026-07-21. El detalle operativo vive en [DEVOTIONAL-CONTENT-PIPELINE.md](./DEVOTIONAL-CONTENT-PIPELINE.md).

### Siguiente etapa: `authors`

- `id`
- `display_name`
- `avatar_url`
- `bio`
- `role` pastor | invitado | editor | equipo
- `verified`

### `devotional_plans` y traducciones

- `id`
- `slug`
- `theme`
- `author_id`
- `duration_days`
- `status` draft | review | published | archived
- `published_at`

Los textos localizados viven en `devotional_plan_translations`.

### `devotional_plan_days` y traducciones

- `id`
- `plan_id`
- `day_number`

Los textos localizados viven en `devotional_plan_day_translations`.

### Siguiente etapa: `user_plan_enrollments`

- `id`
- `user_id`
- `plan_id`
- `started_at`
- `completed_at`

### Siguiente etapa: `user_plan_day_progress`

- `id`
- `user_id`
- `plan_id`
- `day_number`
- `scheduled_for`
- `completed_at`
- `skipped_at`

## Reglas Editoriales

- Todo contenido debe ser cristocentrico, biblico, pastoral y practico.
- La IA puede ayudar a redactar, pero no debe publicar sin revision humana.
- Evitar lenguaje de culpa, condenacion o performance religiosa.
- Cada lectura debe cerrar con una practica concreta.
- Para NTV, usar por ahora referencias claras y la etiqueta "Lectura base" sin copiar bloques largos de texto biblico. Antes de produccion, validar permiso/licencia y agregar credito legal correcto si se incluye texto textual de Nueva Traduccion Viviente.
- Si se cita una Biblia completa, usar traducciones con licencia clara. Para una base publica, evaluar Reina-Valera 1909; para traducciones modernas, conseguir permiso/licencia.

## Roadmap De Palabra

1. MVP local de planes. Completado.
2. Pantalla de plan con inscripcion y progreso. Completado.
3. Catalogo editorial remoto, cache y fallback offline. Completado.
4. Plan sugerido automaticamente despues de una caida.
5. Autores y revisiones editoriales.
6. Sincronizacion opcional de progreso con consentimiento.
7. Biblia contextual, no biblioteca pesada al inicio.
