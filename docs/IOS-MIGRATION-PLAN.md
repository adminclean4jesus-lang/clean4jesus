# Migración iOS: Clean4Jesus

## Veredicto del equipo

Valentina Cruz aprueba una migración por capacidades, no un port directo de Android. Samuel Ortega define controles de salida por hito. Mateo Vidal exige pruebas de dispositivo antes de afirmar que una capa está lista.

## Estado al 2026-07-25

| Área | Estado | Decisión |
| --- | --- | --- |
| Interfaz, Comunidad, Palabra, idiomas, Perfil | Compartida | Lista para compilar en iOS tras QA visual |
| Supabase, correo y Google OAuth | Compartida | Requiere cliente OAuth iOS y prueba de deep link |
| Notificaciones | Compartida | Requiere credenciales APNs y prueba en iPhone |
| VPN/Accesibilidad Android | Solo Android | Se congela, no se modifica |
| Escudo y límites iOS | Pendiente | Family Controls, Managed Settings y Device Activity |
| Filtro de red/DNS iOS | Pendiente | Network Extension y aprobación de Apple |
| Pantalla de interrupción iOS | Pendiente | Shield Configuration / Shield Action |

## Hitos

### Hito 0: Preparación de cuenta y firma

1. Inscribir `Clean4Jesus` en Apple Developer Program.
2. Crear App ID `com.clean4jesus.app` y registrar iPhone de QA.
3. Solicitar/activar Family Controls para app y extensiones.
4. Crear credenciales APNs y configurar EAS/App Store Connect.

### Hito 1: Base React Native iOS

1. Generar proyecto iOS desde Expo prebuild controlado.
2. Validar interfaz, i18n, modo claro/oscuro, Safe Areas y accesibilidad en simulador iPhone.
3. Configurar Google OAuth para bundle iOS y deep link `clean4jesus://`.
4. Probar sesión, perfil, comunidad, contenido remoto y notificaciones en dispositivo físico.

### Hito 2: Protección de apps

1. Añadir targets Swift: Device Activity Monitor, Shield Action y Shield Configuration.
2. Conectar FamilyActivityPicker al módulo React Native.
3. Persistir de forma privada las selecciones mediante App Group.
4. Probar escudo, límites y reversibilidad en iPhone físico.

### Hito 3: Red y seguridad

1. Evaluar Network Extension/DNS con Apple y documentar el entitlement exacto.
2. Si Apple aprueba: implementar una extensión de red mínima, auditable y sin exportar contenido.
3. Si Apple no aprueba: mantener escudo de apps y ofrecer DNS como guía opcional, sin prometer filtrado universal.

### Hito 4: Beta/TestFlight

1. Matriz QA: iPhone SE, iPhone actual, iPad, iOS actual y una versión anterior soportada.
2. TestFlight interno, luego externo.
3. Completar privacidad, App Privacy, capturas, soporte y revisión de App Store.

## No negociables

- Ningún texto, URL, mensaje, historial o contenido visible se envía desde la capa de protección.
- iOS nunca se muestra como protegido hasta que el sistema confirme autorización y cada capa esté comprobada.
- No se modifica el motor Android para implementar iOS.
