# Handoff Apple: Clean4Jesus

Este documento se ejecuta cuando el CEO decida activar Apple Developer. No contiene claves, contrasenas ni certificados.

## Lo que ya esta listo sin pagar

- Bundle ID planeado: `com.clean4jesus.app`.
- Deep link movil: `clean4jesus://auth/callback`.
- Interfaz compartida, Comunidad, Palabra, Perfil, Supabase, Google OAuth, idiomas y tema.
- Ruta iOS que comunica con honestidad que la proteccion nativa aun no esta activa.
- Perfiles EAS para simulador, preview y produccion.

## Lo que no podemos crear sin tu cuenta Apple

Apple Developer Program, App Store Connect, certificados, perfiles de firma, clave APNs, App Group y el entitlement Family Controls pertenecen a la cuenta legal del titular. No se deben crear desde una cuenta ajena ni guardar sus claves en Git.

## Dia de activacion

1. Inscribirse en Apple Developer Program con la identidad que sera titular de Clean4Jesus.
2. Crear la app en App Store Connect con el bundle ID `com.clean4jesus.app`.
3. Crear el identificador de app y habilitar Push Notifications, Associated Domains y las capacidades aprobadas.
4. Solicitar Family Controls para Clean4Jesus y sus extensiones. Guardar la aprobacion en `config/ios-release-readiness.json`.
5. Crear un App Group privado, por ejemplo `group.com.clean4jesus.app`, para compartir seleccion y estado entre app, Device Activity Monitor y pantallas Shield.
6. Crear una clave APNs para EAS/Expo y probar una notificacion en un iPhone real.
7. Crear el cliente OAuth iOS de Google para `com.clean4jesus.app`, actualizar Supabase si hace falta y validar el retorno `clean4jesus://auth/callback`.
8. Generar el proyecto nativo iOS con `npm run prebuild:ios` en macOS/Xcode, anadir los targets Swift y firmarlos con el mismo equipo.
9. Implementar y probar: FamilyActivityPicker, Managed Settings, Device Activity Monitor, Shield Configuration y Shield Action.
10. Ejecutar `npm run test:ios:readiness`, luego subir primero a TestFlight interno.

## Limites que se mantienen

- iOS no inspecciona texto, mensajes, URLs ni pantallas de otras apps.
- iOS no fuerza el cierre de apps de terceros. Usa las pantallas Shield oficiales de Apple.
- Network Extension para DNS/filtro es un frente separado: solo se desarrolla si Apple aprueba el entitlement y el caso de uso.

## Regla de seguridad

No añadir a `.env`, GitHub, Expo, Supabase ni a un APK: certificados `.p12`, perfiles `.mobileprovision`, clave APNs `.p8`, secretos OAuth, Apple ID o contrasenas. Esos secretos viven exclusivamente en Apple, EAS Secrets o el gestor de secretos aprobado.
