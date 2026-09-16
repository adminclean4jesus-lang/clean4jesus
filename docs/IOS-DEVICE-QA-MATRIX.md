# Matriz de Pruebas de Calidad (QA) para iOS

- **Actualizada**: 2026-09-13
- **Objetivo**: Asegurar la estabilidad, accesibilidad y rendimiento en dispositivos iOS reales y simuladores.

## Matriz de Dispositivos y Versiones

| Dispositivo / Target | Versión iOS | Categoría | Pruebas Críticas |
| --- | --- | --- | --- |
| iPhone XS / SE (3rd Gen) | iOS 16.0 (Mínimo) | Pantalla Pequeña / Legacy | Performance, layout sin truncamiento, VoiceOver |
| iPhone 14 / 15 / 16 | iOS 17.x / 18.x | Pantalla Estándar / Actual | Dynamic Island, Safe Areas, Family Controls |
| iPhone Pro Max / Plus | iOS 17.x / 18.x | Pantalla Grande | Adaptación visual, escalado de fuentes, Dynamic Type |

## Batería de Pruebas Funcionales

## Checkpoint y candidata

La última IPA enviada a TestFlight es `1.3.35 (25)`: Family Controls, límites independientes, Shield de marca y `DeviceActivityReport` empaquetado como ExtensionKit. Su procesamiento y los testers internos aún requieren confirmación en App Store Connect. La fuente `1.3.36 (26)` contiene correcciones de PIN y coherencia de selección/estado, pero todavía no está compilada ni validada en iPhone. Una build `25` no prueba esas correcciones.

Registrar por cada prueba: dispositivo, versión iOS, build instalada, fecha, pasos, resultado y evidencia sin exponer nombres de apps seleccionadas ni PIN.

1. **Estabilidad de Arranque**:
   - 20 aperturas continuas en frío (cold start).
   - 10 aperturas en caliente (warm start).
   - Verificación de ausencia de excepciones en `expo-font` o puentes nativos.

2. **Flujo de Protección e Interrupción**:
   - Solicitud de permiso de Family Controls.
   - Selección de aplicaciones con `FamilyActivityPicker`.
   - Visualización de la pantalla de interrupción (Shield Configuration).
   - Límite de una app sin consumir el tiempo de otra; Shield solo en la app que alcanzó el umbral.
   - Cambiar selección con protección activa: la app retirada deja de tener Shield y la nueva recibe su límite; verificar estado visible después de guardar.
   - Abrir `clean4jesus://ios-protection?editLimits=1` y `?editSelection=1` sin PIN: debe pedirlo. Tras PIN correcto, se abre únicamente el editor autorizado; repetir el enlace debe volver a pedir PIN.
   - Revocar Family Controls en Ajustes: el estado no debe seguir diciendo protección activa; al restaurarlo se necesita verificar aplicación efectiva.
   - “Uso de hoy”: comprobar datos, estado vacío, actualización manual y la latencia que impone iOS.
   - Verificación del PIN local sin capturar ni compartir su valor.

3. **Pruebas de Resiliencia y Cierre**:
   - Comportamiento tras reinicio del dispositivo.
   - Comportamiento tras revocación de permisos desde Ajustes de iOS.
   - Funcionamiento sin conexión a internet (offline).

4. **Accesibilidad e Internacionalización**:
   - Pruebas en Español, Inglés, Francés y Portugués Brasileño.
   - Compatibilidad con VoiceOver y navegación por gestos.
   - Adaptación a Dynamic Type sin superposición de texto.
   - Modo claro y modo oscuro.
