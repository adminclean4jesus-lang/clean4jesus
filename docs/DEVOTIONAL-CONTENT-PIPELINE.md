# Pipeline Editorial De Palabra

Fecha de adopcion: 2026-07-21

## Objetivo

Publicar y actualizar planes y devocionales diarios sin incluir cada contenido nuevo dentro de una APK. Supabase conserva el catalogo editorial; la app descarga solo contenido publicado en el idioma elegido y mantiene una copia local para funcionar sin conexion.

## Arquitectura Vigente

1. La app inicia inmediatamente con un catalogo local compacto de respaldo.
2. Luego intenta restaurar el ultimo catalogo valido guardado en el telefono.
3. En segundo plano consulta `get_devotional_plan_catalog` en Supabase. Esta respuesta contiene solo portada, descripcion y titulos de dias; nunca cuerpos completos.
4. Al abrir un plan, la app restaura primero su detalle del cache y consulta `get_devotional_plan_detail` solo para ese plan e idioma.
5. El detalle descargado se valida y queda disponible sin conexion en ese dispositivo.
6. Si un plan nunca se ha abierto y no hay Internet, la app conserva el catalogo visible y ofrece reintentar la descarga, sin inventar contenido.
7. Inscripciones, dias completados y rachas siguen siendo privados y locales. Esta migracion no sube progreso espiritual al servidor.

## Modelo De Datos

- `devotional_plans`: estado editorial, orden, estilo y version del contenido.
- `devotional_plan_translations`: titulo, subtitulo y descripcion por idioma.
- `devotional_plan_days`: estructura y orden de dias.
- `devotional_plan_day_translations`: lectura completa por dia e idioma.
- `daily_devotionals`: identidad, estado editorial y orden de rotacion del devocional diario.
- `daily_devotional_translations`: titulo, versiculo, reflexion, aplicacion y oracion por idioma.

Idiomas iniciales: `es`, `en`, `fr` y `pt`.

Los clientes no tienen acceso directo a estas tablas. La lectura se divide en dos RPC acotadas:

- `get_devotional_plan_catalog`: devuelve exclusivamente planes publicados, pagina el listado y omite versiculos, reflexiones, preguntas, oraciones y practicas;
- `get_devotional_plan_detail`: devuelve el contenido completo de un unico plan publicado;
- ambas usan espanol como fallback si falta una traduccion y nunca exponen borradores.

La RPC historica `get_published_devotional_catalog` permanece temporalmente desplegada para no romper clientes antiguos, pero la app actual ya no la consume.

El devocional diario se obtiene mediante `get_daily_devotional`. Esta RPC:

- recibe idioma y fecha local del dispositivo;
- devuelve un unico contenido publicado para ese dia;
- usa espanol como fallback si falta una traduccion;
- no permite consultar tablas editoriales directamente.

La app guarda el resultado por fecha e idioma. Si el telefono queda sin Internet, usa primero la copia exacta de ese dia y, si aun no existe, muestra un unico devocional breve incluido como respaldo de emergencia.

## Publicar Contenido Hoy

La fuente editorial revisada continua temporalmente en `src/data/devotionalPlans.ts` y sus traducciones. Para comprobar que esa fuente coincide exactamente con la migracion historica aplicada:

```bash
npm run content:devotional:seed
```

El comando no sobrescribe nada. Para publicar una revision, se exige una version editorial mayor y se crea una migracion nueva:

```powershell
$env:DEVOTIONAL_CONTENT_VERSION="2"
npm run content:devotional:publish
```

Para aplicar la migracion nueva al proyecto Supabase vinculado:

```bash
npx supabase db push
```

Para verificar la semilla inmutable de los siete devocionales diarios actuales:

```bash
npm run content:daily:seed
```

Para publicar una revision diaria nueva:

```powershell
$env:DAILY_DEVOTIONAL_CONTENT_VERSION="2"
npm run content:daily:publish
npx supabase db push
```

Una migracion ya aplicada nunca se edita. Una revision editorial posterior debe aumentar `content_version` y crear una migracion nueva con otro timestamp.

## Flujo Editorial Profesional

Antes de publicar un plan:

1. Redaccion cristocentrica y pastoral.
2. Revision teologica humana.
3. Revision de ortografia y traduccion en los cuatro idiomas.
4. Verificacion de referencias biblicas y licencias.
5. Estado `draft` durante preparacion.
6. Paso a `published` solo con aprobacion editorial.
7. Prueba en Android con conexion y sin conexion.

La IA puede ayudar a redactar o traducir, pero no publica automaticamente.

## Seguridad Y Privacidad

- La aplicacion solo contiene URL y llave publica de Supabase.
- `service_role` y credenciales editoriales nunca viven en React Native.
- RLS esta habilitado en las cuatro tablas.
- Los permisos directos de `anon` y `authenticated` estan revocados.
- El cache remoto se acepta unicamente si cumple el contrato completo de un plan.
- El progreso personal no forma parte del catalogo publico.

## Escalado Siguiente

Esta fase elimina la necesidad de una APK para publicar planes o devocionales diarios. La app conserva solo ocho resumenes compactos como respaldo del catalogo; las 224 lecturas completas ya no forman parte del bundle movil. El devocional diario usa tambien un unico respaldo compacto por idioma.

Las siguientes mejoras son:

1. Agregar paginacion visual incremental cuando el catalogo supere 24 planes.
2. Crear un panel editorial con roles `editor`, `reviewer` y `publisher`.
3. Incorporar un calendario editorial explicito para programar contenidos futuros sin cambiar la rotacion de fechas ya publicadas.
4. Definir una politica de administracion del cache cuando existan cientos de planes descargados.

## Verificacion

La migracion inicial quedo comprobada con:

- 8 planes publicados;
- 56 dias por idioma;
- 4 idiomas;
- 224 lecturas localizadas;
- 7 devocionales diarios y 28 traducciones localizadas;
- acceso directo anonimo a tablas denegado;
- TypeScript, 140 pruebas unitarias y 16 recorridos E2E aprobados;
- RPC diaria verificada remotamente en ES/EN/FR/PT;
- separacion remota verificada: catalogo de 8 planes sin `reflection` y detalle individual de 7 dias con contenido completo;
- bundle Android reducido de 6.795.138 a 6.283.328 bytes al retirar las lecturas completas del runtime: 511.810 bytes menos (aprox. 500 KB).

El APK interno actual ronda 216 MB porque es un build `debug` con Expo Dev Client, herramientas de desarrollo, simbolos y binarios nativos. No representa la descarga final de Play Store, que se distribuira como AAB optimizado por dispositivo. El contenido editorial ya no explica ese peso; la siguiente optimizacion relevante son fuentes, iconos y configuracion de release.
