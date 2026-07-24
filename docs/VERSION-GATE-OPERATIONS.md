# Runtime Version Gate

Esta capa permite bloquear versiones antiguas del APK sin tocar Refugio, Palabra ni Comunidad.

## Que hace

- La app consulta `public.runtime_gates` al abrir.
- Si la version instalada es menor a `minimum_supported_version`, Clean4Jesus no deja continuar.
- Si en el futuro queremos usar `recommended_version`, la app ya esta preparada para distinguir una actualizacion sugerida de un bloqueo duro.

## Estado Actual

- Cliente integrado en `app/_layout.tsx` mediante `VersionGateProvider`.
- Logica pura separada en `src/features/runtime/versionGateLogic.ts`.
- Fuente remota: tabla `public.runtime_gates`.
- Migracion aplicada al proyecto Supabase `moqlovsxklxcpihvheyc` el **17 de julio de 2026**.

## Tabla Remota

La tabla tiene estas columnas:

- `platform`: `android` o `ios`
- `minimum_supported_version`
- `recommended_version`
- `hard_block`
- `title`
- `message`
- `update_url`
- `updated_at`

## Version Actual Sembrada

Para Android se dejo:

- `minimum_supported_version = 1.3.6`
- `recommended_version = 1.3.6`
- `hard_block = true`

Eso significa que la version actual pasa, y cualquier APK anterior a `1.3.6` queda bloqueado.

## Como Verificar

### 1. Verificar el cliente

```powershell
cd C:\Users\maite\OneDrive\Escritorio\BlockerXChrist\clean4jesus
npx tsc --noEmit
npm run test:unit -- versionGate
```

### 2. Verificar el gate remoto

```powershell
cd C:\Users\maite\OneDrive\Escritorio\BlockerXChrist\clean4jesus
node scripts/verify-runtime-version-gate.mjs
```

Ese script usa las variables publicas de `.env.local` y comprueba que exista exactamente una fila `android` accesible por la Data API.

## Como Subir El Minimo Soportado

Cuando publiquemos una version nueva y queramos invalidar APKs antiguos:

```sql
update public.runtime_gates
set
  minimum_supported_version = '1.3.7',
  recommended_version = '1.3.7',
  title = 'Actualiza Clean4Jesus',
  message = 'Necesitas la version mas reciente para seguir usando Comunidad y proteccion con seguridad.',
  update_url = null,
  updated_at = timezone('utc', now())
where platform = 'android';
```

## Regla Operativa

- No subir `minimum_supported_version` hasta que el APK nuevo este probado.
- Si el APK nuevo depende de backend nuevo, subir el gate justo despues del release y antes de invitar testers.
- No usar este mecanismo para experimentos visuales ni bugs menores; solo para incompatibilidades reales o seguridad.

## Lo Que No Hace

- No reemplaza QA.
- No reemplaza versionado de APK ni Play Store.
- No actualiza la app automaticamente.
- No toca el flujo de Refugio ni la logica nativa del bloqueo.
