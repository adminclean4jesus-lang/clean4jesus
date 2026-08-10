# Matriz de Pruebas de Calidad (QA) para iOS

- **Fecha**: 2026-08-09
- **Objetivo**: Asegurar la estabilidad, accesibilidad y rendimiento en dispositivos iOS reales y simuladores.

## Matriz de Dispositivos y Versiones

| Dispositivo / Target | Versión iOS | Categoría | Pruebas Críticas |
| --- | --- | --- | --- |
| iPhone XS / SE (3rd Gen) | iOS 16.0 (Mínimo) | Pantalla Pequeña / Legacy | Performance, layout sin truncamiento, VoiceOver |
| iPhone 14 / 15 / 16 | iOS 17.x / 18.x | Pantalla Estándar / Actual | Dynamic Island, Safe Areas, Family Controls |
| iPhone Pro Max / Plus | iOS 17.x / 18.x | Pantalla Grande | Adaptación visual, escalado de fuentes, Dynamic Type |

## Batería de Pruebas Funcionales

## Checkpoint 2026-08-09 — build física

**Estado:** la aplicación abre en un iPhone real y la Comunidad ya carga el proyecto Supabase. El flujo Android ya no se muestra en la navegación principal de iOS.

**Bloqueador actual (P0):** el refugio iOS todavía no está operativo. La pantalla muestra `unverified`, Family Controls/Managed Settings no quedan autorizados y el botón termina en “Permission denied”. Tener Tiempo en pantalla activo no concede automáticamente Family Controls.

**Pendiente para la próxima sesión:**

- Confirmar por qué el módulo `Clean4JesusIosProtectionModule` devuelve capacidades no disponibles en el build físico.
- Obtener y registrar el resultado/error real de `AuthorizationCenter.shared.requestAuthorization(for: .individual)`.
- Hacer que la autorización sea verificable antes de mostrar el refugio como listo.
- Probar `FamilyActivityPicker`, selección de apps/categorías y aplicación de `ManagedSettingsStore`.
- Probar la pantalla ShieldConfiguration y el rescate de 60 segundos en un dispositivo real.
- Sustituir los textos temporales en inglés por el flujo completo en español.

1. **Estabilidad de Arranque**:
   - 20 aperturas continuas en frío (cold start).
   - 10 aperturas en caliente (warm start).
   - Verificación de ausencia de excepciones en `expo-font` o puentes nativos.

2. **Flujo de Protección e Interrupción**:
   - Solicitud de permiso de Family Controls.
   - Selección de aplicaciones con `FamilyActivityPicker`.
   - Visualización de la pantalla de interrupción (Shield Configuration).
   - Ejecución del rescate guiado de 60 segundos.
   - Verificación de hash de PIN local.

3. **Pruebas de Resiliencia y Cierre**:
   - Comportamiento tras reinicio del dispositivo.
   - Comportamiento tras revocación de permisos desde Ajustes de iOS.
   - Funcionamiento sin conexión a internet (offline).

4. **Accesibilidad e Internacionalización**:
   - Pruebas en Español, Inglés, Francés y Portugués Brasileño.
   - Compatibilidad con VoiceOver y navegación por gestos.
   - Adaptación a Dynamic Type sin superposición de texto.
   - Modo claro y modo oscuro.
