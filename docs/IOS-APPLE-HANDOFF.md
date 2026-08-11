# Clean4Jesus: Handoff de Recursos Apple y App Store Connect

- **Fecha**: 2026-08-09
- **Estado**: Preparación y Auditoría de Recursos de Plataforma

## Identificadores y Grupos Registrados

| Recurso | Identificador | Propósito |
| --- | --- | --- |
| App Principal | `com.clean4jesus.app` | Aplicación principal React Native / Expo |
| Extension 1 | `com.clean4jesus.app.DeviceActivityMonitor` | Extensión para supervisión de actividad |
| Extension 2 | `com.clean4jesus.app.ShieldConfiguration` | Extensión para UI de interrupción nativa |
| Extension 3 | `com.clean4jesus.app.ShieldAction` | Extensión para acciones en la pantalla Shield |
| App Group | `group.com.clean4jesus.app` | Almacenamiento seguro compartido entre app y extensiones |

## Entitlements Requeridos

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.family-controls</key>
    <true/>
    <key>com.apple.security.application-groups</key>
    <array>
        <string>group.com.clean4jesus.app</string>
    </array>
</dict>
</plist>
```

## Credenciales y Archivos EAS

- **EAS Project ID**: `11080973-79ad-4aa0-8a81-2a8148d732c4`
- **Perfiles EAS**: `simulator`, `preview`, `production` (configurados en `eas.json`).
- **Seguridad**: NUNCA incluir certificados (`.p12`), llaves privadas (`.p8`) o passwords en el repositorio Git.

## Pasos para Publicación TestFlight / App Store

1. Asegurar la aprobación del entitlement `Family Controls (Distribution)` en el portal de Apple Developer.
2. Sincronizar los Provisioning Profiles de producción y extensiones.
3. Compilar mediante EAS (`eas build --platform ios --profile production`).
4. Verificar apertura e interrupción en un dispositivo iPhone real.
5. Completar la declaración de privacidad en App Store Connect sin prometer bloqueo clínico ni vigilancia invasiva.
