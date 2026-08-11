# Contrato de Permisos Nativos iOS

- **Fecha**: 2026-08-09
- **Propósito**: Especificación formal del contrato de permisos y capacidades de protección en iOS.

## Estados del Permiso de Protección

La API de protección nativa de iOS responderá formalmente en TypeScript con los siguientes estados:

```typescript
export type IosProtectionPermissionStatus =
  | 'not_configured'
  | 'incomplete_setup'
  | 'permission_pending'
  | 'permission_granted'
  | 'protection_active'
  | 'protection_paused'
  | 'protection_limited'
  | 'permission_denied'
  | 'native_error'
  | 'incompatible'
  | 'sync_pending'
  | 'unverified';
```

## Contrato de API JS/TS (`iosProtectionContract.ts`)

| Método | Parámetros | Retorno | Descripción |
| --- | --- | --- | --- |
| `getProtectionCapabilities()` | Nivel de chequeo | `Promise<IosCapabilities>` | Retorna soporte nativo de Family Controls |
| `getProtectionStatus()` | Ninguno | `Promise<IosProtectionStatusInfo>` | Retorna el estado actual del escudo |
| `requestAuthorization()` | Ninguno | `Promise<boolean>` | Dispara el popup oficial de Apple |
| `configureProtection()` | `config: IosProtectionConfig` | `Promise<boolean>` | Guarda la selección y aplica ManagedSettings |
| `pauseProtection()` | `pinHash: string` | `Promise<boolean>` | Pausa el escudo tras validar PIN hash |
| `resumeProtection()` | Ninguno | `Promise<boolean>` | Reactiva las restricciones guardadas |
| `startRescue()` | Ninguno | `Promise<boolean>` | Inicia la ventana de rescate de 60s |
| `clearProtection()` | `pinHash: string` | `Promise<boolean>` | Limpia la selección y remueve restricciones |

## Reglas de Honestidad del Estado

1. La app **NUNCA** reportará `protection_active` si no se ha recibido la confirmación de `AuthorizationCenter.shared.authorizationStatus == .approved`.
2. Si el usuario revoca los permisos en Ajustes del iPhone, la app actualizará de inmediato el estado a `permission_denied`.
3. Si el dispositivo no soporta Family Controls (e.g. iOS < 16), el estado responderá `incompatible`.
