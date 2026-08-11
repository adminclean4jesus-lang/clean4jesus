# ADR-006: Arquitectura de Protección Separada para iOS

- **Estado**: Aprobado por el Consejo Ejecutivo de Clean4Jesus
- **Fecha**: 2026-08-09
- **Autores**: Software Architect (Valentina Cruz), Tech Lead (Samuel Ortega), Security & Privacy Lead (Alma Torres)

## Contexto y Problema

Clean4Jesus ayuda a personas a vivir en libertad frente a la vulnerabilidad digital y la pornografía. En Android, la protección nativa utiliza `VpnService` (DNS local) y `AccessibilityService` para la pantalla de interrupción.

iOS opera bajo un modelo de sandbox y seguridad fundamentalmente distinto. Apple prohíbe el uso de servicios de accesibilidad para filtrado o interrupción de aplicaciones de terceros y restringe el uso de VPNs. Sin embargo, Apple provee el framework **Screen Time** (`FamilyControls`, `ManagedSettings`, `DeviceActivity`) y extensiones del sistema (`ShieldConfiguration`, `ShieldAction`, `DeviceActivityMonitor`).

Es imperativo implementar la protección en iOS usando **exclusivamente las APIs oficiales de Apple**, manteniendo la base de código de Android intacta y congelada.

## Decisiones de Arquitectura

1. **Separación Plataforma por Adaptadores**:
   - `src/features/shield/shieldService.ts` bifurca la lógica usando adaptadores explícitos por plataforma (`.ios.ts` y `.android.ts`).
   - Cero código de VPN o AccessibilityService importado o invocado en iOS.

2. **Capa Nativa iOS (Screen Time Framework)**:
   - **Family Controls**: Solicita autorización al usuario (`AuthorizationCenter.shared.requestAuthorization`). Presenta `FamilyActivityPicker` para selección privada de aplicaciones y categorías.
   - **Managed Settings**: Aplica restricciones de aplicaciones y dominios web seleccionados mediante `ManagedSettingsStore`.
   - **Device Activity**: Supervisa intervalos de uso y límites de tiempo mediante `DeviceActivitySchedule` y `DeviceActivityMonitor`.
   - **Shield Configuration**: Define la UI nativa de interrupción (título, mensaje cristiano/pastoral, colores de Clean4Jesus, icono).
   - **Shield Action**: Maneja las interacciones del usuario en el Shield (solicitar rescate o cerrar) sin ofrecer bypass permanente.

3. **Comunicación Inter-Proceso Segura mediante App Group**:
   - Se utiliza el App Group `group.com.clean4jesus.app` compartido entre la app principal y las extensiones nativas.
   - **Datos permitidos en App Group**:
     - `shieldEnabled` (boolean)
     - `rescueActiveTimestamp` (number / timestamp)
     - `pinHash` (cadena SHA-256)
     - `selectedAppTokens` (FamilyActivitySelection tokenizado por Apple)
   - **Datos ESTRICTAMENTE PROHIBIDOS en App Group o Backend**:
     - URLs de páginas visitadas.
     - Historial de navegación o búsquedas.
     - Contenido de pantalla o texto detectado.
     - PIN en texto plano.

4. **Rescate de 60 Segundos en iOS**:
   - Pausa guiada de respiración (4-2-6) con pasaje bíblico.
   - Al activarse el rescate, se escribe la timestamp en el App Group y se notifica al Shield Action para permitir la pausa temporal sin apagar el escudo.

## Consecuencias y Garantías

- **Android Intacto**: La carpeta `android/` permanece 100% libre de cambios.
- **Cumplimiento con Apple**: Uso legítimo de Screen Time APIs garantizando la aprobación en App Store Connect.
- **Privacidad Absoluta**: Cumplimiento del principio "Privacidad por Diseño". Cero telemetría invasiva.
