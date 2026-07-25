# Contrato nativo iOS

## Propósito

Este documento define el puente que se conectará después de la activación de Apple Developer. No activa protección antes de tener aprobación, extensiones Swift y validación en un iPhone real.

## Módulo React Native

`src/features/iosProtection/iosProtectionContract.ts` define estos métodos para el futuro módulo Swift `Clean4JesusScreenTime`:

- `getAuthorizationStatus`: consulta Family Controls sin inferir permisos.
- `requestAuthorization`: solicita autorización desde una acción explícita.
- `presentFamilyActivityPicker`: presenta el selector oficial de Apple.
- `applyShield` y `clearShield`: aplican o quitan una selección aprobada mediante Managed Settings.
- `scheduleUsageLimit`: programa límites mediante Device Activity.

## Targets futuros en Xcode

1. App principal `Clean4Jesus`.
2. Device Activity Monitor Extension.
3. Shield Configuration Extension.
4. Shield Action Extension.

Las extensiones compartirán solo una selección opaca mediante App Group. No almacenarán texto leído, URLs, capturas, historial ni contenido de otras apps.

## Límite de seguridad

Family Controls, Managed Settings, Network Extension, APNs y Google OAuth iOS se conectan únicamente cuando Apple active las capacidades y el flujo pase QA en un iPhone real.
