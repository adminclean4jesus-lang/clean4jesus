# Auditoria Del Proyecto Clean4Jesus

Fecha: 2026-07-13

Objetivo: evaluar que tan profesional y mantenible esta hoy la base de Clean4Jesus a nivel de arquitectura, configuracion, documentacion, testing, seguridad y preparacion real para colaboracion o produccion.

## Resumen Ejecutivo

Clean4Jesus ya no es un experimento roto. Hoy existe una base funcional real:

- compila,
- pasa TypeScript,
- pasa pruebas unitarias,
- pasa pruebas e2e,
- exporta web,
- tiene Android nativo integrado,
- y tiene documentacion viva de producto.

Eso es una muy buena señal.

Pero todavia no esta en estado "equipo senior listo para escalar" ni "produccion segura". La sensacion actual es:

- **producto serio en construccion**, no proyecto amateur,
- pero con **deuda operativa y de profesionalizacion** importante,
- especialmente en seguridad de datos locales, versionado, release management, higiene del repo y documentacion de onboarding.

## Calificacion General

### 1. Estructura de proyecto: 8/10

Puntos fuertes:

- Separacion razonable entre `app/`, `src/`, `android/`, `assets/`, `tests/` y `docs/`.
- Las funcionalidades viven agrupadas por dominio en `src/features/`.
- El proyecto tiene modulos claros para:
  - `shield`
  - `pin`
  - `habits`
  - `devotionalPlans`
  - `appProtection`

Hallazgos:

- La estructura es buena para seguir iterando, pero aun mezcla:
  - logica de producto,
  - estado local,
  - detalles nativos Android,
  - y decisiones de UI visibles.
- Hay una carpeta `scripts/` vacia, lo cual sugiere espacio reservado sin uso real.
- Existen artefactos y salidas temporales dentro del repo (`artifacts/`, `dist/`, `test-results/`, `tmp/`) que para un equipo mas grande deberian gestionarse con mas disciplina.

### 2. Arquitectura de codigo: 7/10

Puntos fuertes:

- Hay un intento claro de arquitectura por dominio, no solo por pantallas.
- Los nombres de varios modulos son buenos y legibles.
- La logica de progreso devocional y rachas ya vive fuera de la UI.
- Se usan servicios como:
  - `shieldService.ts`
  - `devotionalPlanService.ts`
  - `appProtectionService.ts`
  - `habitService.ts`

Hallazgos:

- Aun hay dependencias directas entre dominios que convendria estabilizar.
  - Ejemplo: `devotionalPlanService.ts` llama a `markDevotionalRead()` de habitos.
- La interfaz de varios modulos todavia esta muy acoplada a almacenamiento local y a decisiones de pantalla.
- El estado y la persistencia no estan centralizados en una capa de dominio mas profunda.
- `AppHeader` lleva una version hardcodeada por defecto (`v1.2.12`), lo cual es una señal de deuda de configuracion.

### 3. Documentacion: 8.5/10

Puntos fuertes:

- El proyecto tiene bastante contexto operativo:
  - `DIRECTIVAS-CLEAN4JESUS.md`
  - `ROADMAP-CLEAN4JESUS-2026-06-15.md`
  - `VERSION-HISTORY.md`
  - `ANDROID-BLOQUEO-NATIVO.md`
  - `TESTING-CELULAR.md`
  - `DEVELOPMENT-BUILD-APK.md`
  - `PALABRA-CONTENT-ARCHITECTURE.md`
  - `PRD-CLEAN4JESUS-NEXT.md`
- Hay memoria de decisiones, checkpoints y reglas de trabajo.

Hallazgos:

- **No existe `README.md`**, y eso es una falta importante.
- Falta un documento corto de onboarding tecnico que responda:
  - que es el proyecto,
  - como se instala,
  - como se corre,
  - como se testea,
  - como se genera APK local,
  - que partes estan congeladas,
  - y cuales son los riesgos conocidos.
- `CLAUDE.md` hoy no aporta valor real.
- `AGENTS.md` es minimo y depende demasiado de archivos externos.

### 4. Testing y calidad: 7.5/10

Estado actual validado en esta auditoria:

- `npx tsc --noEmit` ✅
- `npm run test:unit` ✅
- `npm run test:e2e` ✅
- `npx expo export --platform web --clear` ✅

Puntos fuertes:

- Hay cobertura unitaria para logica sensible:
  - streaks
  - PIN
  - reminder policy
  - shield service
  - app protection policy
- Hay pruebas e2e reales con Playwright.

Hallazgos:

- La cobertura sigue siendo estrecha para el tamano de la app.
- No hay una matriz clara de pruebas por modulo.
- No hay evidencia de pruebas automatizadas del codigo nativo Android.
- No hay smoke tests dedicados para:
  - permisos,
  - onboarding del refugio,
  - consistencia de version,
  - o regresiones visuales.

### 5. Seguridad y manejo de datos: 5/10

Este es el frente mas delicado.

Puntos fuertes:

- La app no tiene aun backend real expuesto ni flujo de auth productivo.
- La documentacion ya reconoce varias restricciones y limites tecnicos.
- Se removieron permisos sensibles no usados como overlay.

Hallazgos graves:

- El **PIN del guardian se guarda en texto plano en AsyncStorage**.
  - Archivo: `src/features/pin/pinService.ts`
- AsyncStorage tambien guarda:
  - estado del escudo,
  - progreso,
  - habitos,
  - configuraciones,
  - reglas de proteccion.
- Para un MVP local esto puede aceptarse temporalmente, pero **no es aceptable para produccion** en un producto de proteccion personal.
- `AndroidManifest.xml` aun tiene `android:allowBackup="true"`.
  - Eso puede permitir backups del estado local en escenarios no deseados.
- El servicio de accesibilidad sigue declarando `android:canRetrieveWindowContent="true"`.
  - Puede ser necesario para la funcionalidad actual, pero aumenta superficie de percepcion y riesgo.

Conclusión de seguridad:

- El proyecto **no esta listo para produccion sensible** mientras el PIN siga en AsyncStorage plano y el backup siga habilitado.

### 6. Configuracion y releases: 4.5/10

Hallazgos importantes:

- Hay **desalineacion de versionado**:
  - `package.json` = `1.2.12`
  - `app.json` = `1.2.12`
  - `AppHeader` por defecto = `v1.2.12`
  - `android/app/build.gradle` = `versionName "1.2.8"` y `versionCode 18`
- Esto no deberia pasar en una app profesional.
- El `release` Android sigue firmando con `debug.keystore`.
  - Eso es correcto para pruebas locales.
  - **No es correcto para una release real**.
- No existe una fuente unica de verdad para version, build number y version visible.

### 7. Higiene del repositorio: 5.5/10

Puntos fuertes:

- Existe `.gitignore`.
- Ya ignora varias carpetas correctas como `.expo/`, `dist/`, `node_modules/`.

Hallazgos:

- El repo esta en una situacion de higiene intermedia:
  - `artifacts/`
  - `test-results/`
  - `tmp/`
  no parecen estar totalmente gobernados por `.gitignore`.
- Hay una imagen grande suelta en raiz: `logo clean4jesus.png`.
- `debug.keystore` existe dentro del proyecto Android.
- El `git status` muestra muchisimos archivos agregados o sin normalizar, lo cual indica que la historia del repo aun no esta estabilizada como proyecto mantenido.

### 8. UX copy y consistencia de texto: 6.5/10

Puntos fuertes:

- El tono general del producto esta bastante alineado con la vision cristiana y pastoral.
- Varias pantallas ya hablan con identidad.

Hallazgos:

- Sigue habiendo riesgo de texto mojibake en consolas o archivos si no cuidamos la codificacion UTF-8.
  - Ejemplo detectado durante la auditoria en salidas de terminal: nombres y tildes pueden verse corruptos aunque el archivo fuente este bien.
    - `Comparte una victoria...`
- Tambien hay mojibake en `habitService.ts` dentro de nombres sugeridos.
- Esto baja mucho la percepcion de calidad.

## Hallazgos Mas Importantes

### Hallazgo 1. Falta README

Prioridad: Alta

Sin `README.md`, un desarrollador nuevo no tiene entrada formal al proyecto.

Impacto:

- onboarding lento,
- dependencia excesiva de memoria conversacional,
- y poca credibilidad externa del repo.

### Hallazgo 2. Versionado desalineado

Prioridad: Alta

El proyecto hoy tiene varias fuentes de version que no estan sincronizadas.

Impacto:

- confusion en builds,
- errores de QA,
- riesgo de instalar una version y creer que es otra.

### Hallazgo 3. PIN inseguro

Prioridad: Muy alta

Guardar el PIN en AsyncStorage sin proteccion es una debilidad seria.

Impacto:

- mala postura de seguridad local,
- riesgo reputacional fuerte si el producto escala,
- contradiccion con la propuesta de seguridad del producto.

### Hallazgo 4. Backup Android habilitado

Prioridad: Alta

`allowBackup="true"` no es ideal para una app que maneja controles de proteccion y PIN.

### Hallazgo 5. Higiene de repo incompleta

Prioridad: Media-Alta

Hay demasiados artefactos, archivos auxiliares y rutas de prueba conviviendo con el codigo fuente.

### Hallazgo 6. Comunidad con datos mock incrustados en pantalla

Prioridad: Media

`community.tsx` tiene perfiles, contadores y mensajes fake adentro del screen.

Impacto:

- poca profundidad de arquitectura,
- dificulta migrar a backend real,
- y hace mas fragil la evolucion del modulo.

### Hallazgo 7. Shield muy acoplado a checkpoints documentales

Prioridad: Media

No es un bug de codigo, pero sí un riesgo de mantenibilidad.

La logica del Refugio depende mucho de memoria operativa y disciplina manual. Eso ha funcionado para proteger checkpoints, pero un equipo mas grande necesitaria:

- contratos mas claros,
- pruebas mas especificas,
- y modulos nativos mejor encapsulados.

## Lo Que Un Senior Dev Veria Como Muy Positivo

- Hay vision de producto clara.
- Hay documentacion viva de decisiones, no solo codigo suelto.
- Ya existen checkpoints definidos y version history.
- La app ya tiene capas reales:
  - Expo / React Native
  - modulo nativo Android
  - tests unitarios
  - pruebas e2e
- No es un repo vacio ni una demo cosmética.

## Lo Que Un Senior Dev Criticaria De Inmediato

- No hay README.
- El PIN esta guardado de forma insegura.
- Hay versionado inconsistente.
- El repo todavia esta “ensuciado” por artefactos de trabajo.
- El contenido mock y varios textos siguen demasiado pegados a las pantallas.
- Falta una politica mas clara de configuracion por entorno.

## Recomendacion Profesional

Antes de seguir agregando muchas features nuevas, conviene abrir una fase corta de **profesionalizacion del proyecto**.

Orden recomendado:

1. Crear `README.md` serio.
2. Unificar versionado.
3. Endurecer seguridad local del PIN.
4. Limpiar e institucionalizar artefactos y `.gitignore`.
5. Corregir mojibake y consistencia de texto.
6. Separar mocks/datos de comunidad de la pantalla.
7. Crear una checklist de release de APK debug vs produccion.

## Veredicto

**Estado actual:** proyecto serio en progreso, con buena base funcional y documental, pero aun no al nivel de un repositorio mobile listo para equipo senior grande o para produccion sensible.

**Mi lectura honesta:** si hoy esto lo revisa un desarrollador senior fuerte, no diria "esto esta improvisado", pero sí diria:

"Hay una buena base y bastante trabajo real, pero antes de escalar o salir a produccion hay que ordenar seguridad, versionado, onboarding y disciplina de release."
