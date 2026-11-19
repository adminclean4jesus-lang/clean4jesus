# Operación del repositorio

## Fuente de verdad y límites

- El repositorio activo es `C:\Users\millo\Desktop\Clean4Jesus`.
- OneDrive no es una ruta válida para código, builds ni artefactos de Clean4Jesus.
- `C:\c4j` puede usarse solo como copia corta temporal para Gradle; nunca como fuente de verdad ni destino de entrega.
- GitHub (`adminclean4jesus-lang/clean4jesus`) es el respaldo remoto oficial. No se hace push, release ni despliegue sin autorización explícita.
- La landing pública y sus scripts se mantienen fuera del trabajo móvil salvo una solicitud explícita de landing.

## Estructura

| Ruta | Propósito |
| --- | --- |
| `app/` | Rutas y pantallas Expo Router. |
| `src/features/` | Lógica de dominio: autenticación, PIN, protección, comunidad y contenido. |
| `android/` | VPN, Accesibilidad e interrupción nativas. |
| `modules/` y `targets/` | Protección iOS, Family Controls y extensiones Screen Time. |
| `supabase/` | Migraciones y Edge Functions. Las migraciones son inmutables. |
| `tests/unit/` | Contratos y lógica de regresión. |
| `tests/e2e/` | Pruebas web de interfaz; no sustituyen una prueba en teléfono. |
| `docs/` | Instrucciones vigentes y archivo histórico. |
| `artifacts/apk/` | Solo APK local `current` y `previous`; ignorado por Git. |
| `marketing/`, `videos/`, `assets/` | Material de producto; no se elimina sin revisión editorial. |

## APK Android local

Android se compila exclusivamente con Gradle local. No usar EAS para APK Android.

```powershell
cd C:\Users\millo\Desktop\Clean4Jesus
npm run build:android:local
```

El comando compila ARM64 release y rota automáticamente:

- `artifacts/apk/current/Clean4Jesus-current.apk`
- `artifacts/apk/previous/Clean4Jesus-previous.apk`

No requiere Metro ni QR. Antes de una build, ejecutar QA y las revisiones adversariales requeridas en `DIRECTIVAS-CLEAN4JESUS.md`.

## iOS

iOS se distribuye por EAS/TestFlight. Cada build consume cuota: ejecutar una nueva solo cuando exista una candidata aprobada, `buildNumber` incrementado y QA relevante cerrada. No usar una IPA o ruta Android como sustituto.

## Verificación local

```powershell
npx tsc --noEmit
npm run test:unit
npx expo-doctor
npm run test:repository-hygiene
```

Las comprobaciones remotas de Supabase requieren credenciales de QA y no deben ejecutarse con secretos en Git. `npm run test:e2e` es una capa web adicional; la liberación móvil exige evidencia en dispositivo real.

## Higiene de cambios

1. No mezclar cambios de producto, migraciones y landing en un mismo cambio sin una razón explícita.
2. No modificar una migración aplicada: crear una nueva migración fechada.
3. No incluir secretos, certificados, APK, AAB, IPA, `node_modules`, cachés ni logs en Git.
4. Antes de borrar, clasificar el objetivo y preservar marketing, legal, archivo histórico y artefactos canónicos.
