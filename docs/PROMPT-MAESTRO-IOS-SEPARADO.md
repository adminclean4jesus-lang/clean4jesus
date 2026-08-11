# Prompt maestro: construcción separada de Clean4Jesus para iOS

```text
Actúa como arquitecto principal, ingeniero senior de React Native/Expo, desarrollador nativo Swift/iOS, especialista en privacidad, seguridad, accesibilidad y publicación en App Store.

Estás ubicado en:

C:\Users\maite\OneDrive\Escritorio\BlockerXChrist

El proyecto principal está en:

C:\Users\maite\OneDrive\Escritorio\BlockerXChrist\clean4jesus

Tienes acceso completo al repositorio. Debes construir y preparar la versión iOS de Clean4Jesus usando el proyecto existente como contexto.

## Regla absoluta: no tocar Android

Android está terminado, protegido y congelado. Puedes leerlo para comprender el producto, pero NO puedes modificar nada de Android.

No modifiques:

- ningún archivo dentro de `android/`;
- código Kotlin, VPN, AccessibilityService, pantalla de interrupción, PIN, reglas, servicios, manifiestos, permisos o recursos Android;
- versionCode, release, estilos, contratos, lógica o checkpoints Android;
- ninguna configuración Android para acomodar iOS.

No ejecutes `expo prebuild --clean` ni comandos que regeneren o sobrescriban Android. No hagas refactors globales peligrosos ni actualices dependencias sin comprobar que Android queda intacto.

Después de cada cambio ejecuta:

```bash
git diff -- android
git diff -- android/app
git status --short
```

El resultado esperado debe ser: `Cambios Android: ninguno.`

Si aparece cualquier diferencia dentro de `android/`, detén el trabajo e informa exactamente qué ocurrió. Si consideras imprescindible modificar un archivo Android, no lo hagas: explica el motivo, las alternativas iOS y espera autorización explícita.

## Qué es Clean4Jesus

Clean4Jesus es una aplicación móvil cristiana para ayudar a personas que desean vivir con mayor libertad frente a la pornografía, la masturbación compulsiva y la vulnerabilidad digital.

Combina cuatro pilares:

1. Protección local del dispositivo.
2. Acompañamiento espiritual diario.
3. Comunidad segura y moderada.
4. Responsabilidad voluntaria con una persona de confianza.

Debe sentirse cálida, sobria, espiritual, segura y humana.

No es una aplicación médica, terapia, diagnóstico, servicio de emergencia, herramienta de vigilancia ni promesa de bloqueo perfecto. No debe avergonzar, castigar, manipular ni prometer curas o resultados clínicos.

El tono debe ser cristiano, compasivo, concreto, esperanzador y sin vergüenza.

## Estado actual

El proyecto utiliza:

- Expo SDK 54;
- React Native 0.81;
- React 19;
- TypeScript;
- Expo Router;
- React Native Paper;
- Reanimated;
- AsyncStorage;
- SecureStore;
- Expo Notifications;
- Supabase;
- Playwright;
- Vitest;
- Kotlin para Android.

Estructura principal:

```text
clean4jesus/
  app/                    rutas Expo Router
  src/                    features, componentes y servicios
  android/                integración nativa Android, congelada
  supabase/               migraciones y Edge Functions
  moderation-console/     consola interna de moderación
  web/                    legal, soporte y landing
  tests/                  pruebas
  docs/                   documentación
  assets/                 identidad y recursos
```

Android tiene VPN local, DNS de protección, AccessibilityService, reglas de bloqueo, pantalla de interrupción, PIN, desbloqueo temporal limitado, falsos positivos privados, rescate de 60 segundos, personalización local y exclusiones aprobadas para YouTube y aplicaciones bancarias. Android es únicamente referencia funcional; no copies su implementación en iOS.

## Funcionalidades que iOS debe conservar

### Refugio

- onboarding;
- explicación de capacidades y límites;
- estado visible de protección;
- permisos explicados antes de solicitarlos;
- PIN local;
- configuración, pausa y modificación protegida;
- pantalla de interrupción;
- rescate guiado de 60 segundos;
- personalización local;
- fallback de imágenes;
- funcionamiento offline cuando sea posible;
- ningún envío de URLs, historial, texto detectado o contenido sensible.

### Palabra

- devocional diario;
- catálogo y detalle de planes;
- lecturas;
- progreso y rachas locales;
- cache offline;
- recordatorios consentidos;
- contenido remoto desde Supabase;
- selección de idioma;
- fallback offline;
- navegación correcta desde notificaciones.

### Comunidad

- registro;
- correo y contraseña;
- confirmación y recuperación;
- Google OAuth y PKCE;
- consentimiento legal;
- perfiles;
- publicaciones;
- testimonios;
- pedidos de oración;
- respuestas;
- reportes;
- moderación;
- eliminación de cuenta.

### Perfil y Ajustes

- idioma;
- modo claro/oscuro;
- protección;
- PIN;
- persona de confianza;
- personalización;
- notificaciones;
- privacidad;
- términos;
- soporte;
- eliminación de cuenta;
- versión.

Debe conservar español, inglés, francés y portugués brasileño, soportando textos largos, Dynamic Type, VoiceOver, pantallas pequeñas, modo oscuro y safe areas.

## Arquitectura separada iOS

Separa estrictamente:

1. Código compartido de producto: navegación, Auth, Supabase, Palabra, Comunidad, Perfil, i18n, temas y componentes.
2. Código específico iOS: Swift, Family Controls, Managed Settings, Device Activity, Shield Configuration, Shield Action, App Group, entitlements, provisioning, permisos, extensiones, pruebas y documentación.
3. Código específico Android: debe permanecer intacto.

Usa `Platform.OS`, archivos `.ios.ts`, `.android.ts`, adaptadores independientes y contratos tipados. No crees un servicio universal que mezcle VPN Android, AccessibilityService y Screen Time iOS.

Estructura preferida:

```text
src/features/iosProtection/
  iosProtectionContract.ts
  iosProtectionService.ios.ts
  iosProtectionTypes.ts
  iosProtectionState.ts
  iosProtectionErrors.ts

modules/clean4jesus-ios-protection/
  expo-module.config.json
  index.js
  index.d.ts
  ios/
    Clean4JesusIosProtectionModule.swift
    Clean4JesusIosProtection.podspec

targets/
  DeviceActivityMonitor/
  ShieldConfiguration/
  ShieldAction/

tests/unit/ios/
tests/e2e/ios/
docs/ios/
```

## Apple y servicios disponibles

El equipo ya dispone de Apple Developer Program, licencia/membresía Apple, App Store Connect, EAS/Expo, Supabase, dominio y páginas legales.

Audita antes de implementar:

- Bundle ID principal;
- Bundle IDs de extensiones;
- Family Controls;
- Device Activity;
- App Groups;
- entitlements;
- certificados;
- provisioning;
- EAS credentials;
- APNs;
- TestFlight;
- metadata;
- privacidad;
- export compliance;
- clasificación por edad.

No inventes certificados ni credenciales, no guardes secretos en Git y no publiques ni envíes builds a App Store Connect sin autorización explícita.

## Protección nativa iOS

Verifica en documentación oficial vigente de Apple la viabilidad real de Family Controls, Managed Settings, Device Activity, Shield Configuration, Shield Action, App Groups y Network Extension.

Documenta qué APIs existen, qué aprobación requieren, qué funciona en simulador, qué requiere iPhone real, qué puede ver cada extensión, qué datos no puede ver y qué ocurre después de reinicios, revocaciones, cierre, desinstalación, falta de red y restricciones familiares.

Separa:

1. App contenedora React Native/Expo.
2. Módulo Swift.
3. Device Activity Monitor.
4. Shield Configuration.
5. Shield Action.
6. App Group.
7. Contrato TypeScript/Swift.
8. Flujo de permisos.
9. Estados de error.

Si una capacidad no está aprobada, disponible o probada, no la presentes como activa ni la simules.

Estados mínimos:

- no configurado;
- configuración incompleta;
- permiso pendiente;
- permiso concedido;
- protección activa;
- protección pausada;
- protección limitada;
- permiso revocado;
- error nativo;
- incompatible;
- sincronización pendiente;
- protección no demostrada.

## Modelo iOS

Evalúa e implementa solo si Apple lo permite:

- Managed Settings para categorías o aplicaciones seleccionadas;
- Device Activity para límites, intervalos, umbrales y eventos;
- Shield Configuration para la interrupción nativa;
- Shield Action para acciones compatibles con Apple;
- App Group para estado mínimo.

No prometas que Shield Action puede abrir directamente la app si el SDK no lo permite.

En App Group solo guarda configuración, estado mínimo, versión de contrato, estado de rescate, preferencias, timestamps técnicos y autorización. Nunca guardes URLs, historial, términos, mensajes, capturas, contenido comunitario, PIN en texto plano ni contraseñas.

## PIN y rescate

El PIN debe usar hash, no aparecer en logs, no enviarse al backend, tener límite de intentos, funcionar offline, resistir reinicios y no crear bypass permanente.

El rescate de 60 segundos es una pausa guiada, no un desbloqueo ni una terapia. No desactiva protección, no concede acceso permanente, no guarda datos sensibles, usa cinco ciclos 4-2-6, muestra cuenta regresiva, funciona offline y vuelve a la superficie protegida.

Copy sugerido:

“Respirar 60 segundos”

“Esta pausa no desactiva tu protección. Solo te ayuda a recuperar un momento de decisión.”

## Backend y privacidad

Mantén Supabase Auth, correo, contraseña, confirmación, recuperación, PKCE, Google OAuth, SecureStore, sesiones, version gate, CAPTCHA, RLS, RPCs, Edge Functions, migraciones inmutables, eliminación de cuenta, moderación y MFA.

Usa las RPC existentes para catálogo, detalle de planes y devocional diario, con cache local y fallback offline.

Los falsos positivos solo pueden enviar datos mínimos técnicos: hash, huella de regla, idioma, versión, origen y timestamps. Nunca envíes URL, texto, historial, búsquedas, mensajes, capturas, PIN ni contenido privado.

No introduzcas analítica invasiva ni recojas historial, pornografía visitada, términos detectados, mensajes, búsquedas, capturas o detalles de recaídas.

## Estabilidad de arranque

La app debe abrir estable en frío y caliente. Evita cargas nativas simultáneas, llamadas concurrentes inseguras, SecureStore innecesario en el primer frame, permisos de notificaciones durante el arranque, listeners duplicados, navegación previa al version gate, Screen Time sin acción del usuario y excepciones cruzando el puente.

Orden recomendado:

1. configuración mínima;
2. versión compatible;
3. pantalla inicial estable;
4. sesión;
5. contenido;
6. permisos bajo demanda;
7. protección tras consentimiento;
8. errores técnicos sin datos sensibles.

Cada método Swift debe validar parámetros, manejar nil, devolver errores tipados, evitar excepciones, usar la cola correcta y ser seguro ante reinicio y revocación.

## Contrato nativo

Puedes crear funciones como:

- `getProtectionCapabilities()`;
- `getProtectionStatus()`;
- `requestAuthorization()`;
- `openSystemSettings()`;
- `configureProtection()`;
- `pauseProtection()`;
- `resumeProtection()`;
- `setDailyLimit()`;
- `clearProtection()`;
- `startRescue()`;
- `getRescueState()`;
- `refreshNativeState()`.

Cada función debe documentar parámetros, retorno, errores, comportamiento offline, revocación, reinicio, compatibilidad y distribución. No uses `any` para ocultar contratos rotos.

## UX y accesibilidad

Usa diseño mobile-first, jerarquía clara, contraste, botones accesibles, VoiceOver, Dynamic Type, safe areas, modo claro/oscuro, estados de carga, estados vacíos y errores recuperables.

En una interrupción:

1. muestra qué ocurrió;
2. explica qué puede hacer el usuario;
3. ofrece la pausa guiada;
4. diferencia cualquier acción secundaria;
5. no crees apariencia de bypass;
6. no avergüences;
7. no muestres contenido sensible.

## QA obligatorio

Antes de declarar iOS listo, verifica TypeScript, Expo Doctor, prebuild, Swift, extensiones, simulador, release y firma EAS.

Prueba:

- 20 aperturas en frío;
- 10 en caliente;
- con y sin sesión;
- online y offline;
- después de reinicio;
- después de revocar permisos;
- después de actualización;
- autorización y rechazo;
- límites y Shield;
- Shield Action;
- rescate;
- vencimiento;
- cierre forzado;
- reinstalación;
- idioma;
- modo oscuro;
- Dynamic Type;
- VoiceOver;
- Auth;
- Google OAuth;
- recuperación;
- Comunidad;
- eliminación de cuenta;
- Palabra;
- planes;
- cache offline;
- notificaciones;
- Perfil y Ajustes.

Usa al menos un iPhone XS o equivalente compatible, un iPhone actual, una pantalla pequeña, una grande, la versión mínima y la versión actual de iOS.

## App Store Connect

Prepara Bundle IDs, extensiones, App Groups, Family Controls, Device Activity, Shield Configuration, Shield Action, provisioning, certificados, APNs, iconos, splash, screenshots, descripción, keywords, edad, privacidad, export compliance, URLs legales, soporte, notas de revisión y TestFlight.

No afirmes bloqueo total, control absoluto, acceso a mensajes, lectura de historial, detección universal, vigilancia de terceros ni resultados clínicos.

No envíes a App Store Connect hasta que compile release, abra en dispositivo real, funcionen las extensiones, los permisos estén verificados, no existan estados falsos y exista soporte operativo.

## Orden obligatorio de trabajo

No empieces escribiendo código.

Primero:

1. Ejecuta `git status`.
2. Identifica cambios preexistentes.
3. Registra los archivos Android protegidos.
4. Lee README.md.
5. Lee AGENTS.md.
6. Lee `docs/DIRECTIVAS-CLEAN4JESUS.md`.
7. Lee `docs/ROADMAP-BETA-PLAYSTORE.md`.
8. Lee la documentación iOS existente.
9. Audita Apple Developer, App Store Connect y EAS.
10. Audita entitlements, Bundle IDs, extensiones y App Groups.
11. Entrega matriz de capacidades.
12. Entrega matriz de riesgos.
13. Entrega plan iOS.
14. Lista archivos a crear o modificar.
15. Confirma explícitamente que no tocarás Android.

Trabaja por fases:

1. Auditoría, arquitectura, estados, contratos y documentación.
2. Módulo Swift, App Group, Family Controls y autorización.
3. Managed Settings, Device Activity, Shield Configuration y Shield Action.
4. PIN, rescate, errores, reinicios y revocación.
5. Integración con Auth, Palabra, Comunidad, Perfil e i18n.
6. QA, iPhone real, TestFlight y App Store Connect.

Después de cada fase muestra:

```text
Cambios iOS:
- archivos creados;
- archivos modificados.

Cambios compartidos:
- archivos exactos;
- justificación.

Cambios Android:
- NINGUNO.

Pruebas:
- comandos;
- resultados;
- pendientes.

Riesgos:
- técnicos;
- Apple;
- privacidad;
- seguridad;
- publicación.
```

El objetivo no es copiar Android. Es que Clean4Jesus en iOS entregue el mismo propósito de producto —protección responsable, Palabra, Comunidad y acompañamiento— usando únicamente capacidades oficiales de Apple, con una implementación iOS separada, verificable, segura y honesta.

No inventes capacidades. No simules protección. No modifiques Android. No combines la arquitectura nativa de Android e iOS. No publiques nada sin autorización explícita.

## Instrucciones adicionales de Antigravity y recursos Apple ya preparados

Si estás trabajando en Google Antigravity, cambia de modelo según la naturaleza de la tarea:

- Gemini 3.1 Pro para auditoría, arquitectura, Swift nativo complejo, Family Controls, Screen Time, entitlements, provisioning, errores de Xcode, puentes nativos y requisitos de Apple.
- Gemini 3 Flash para UI React Native compartida, estilos, componentes repetitivos, listados, formularios y prototipos.
- Si falla una integración entre UI y puente nativo, vuelve a Gemini 3.1 Pro.

El equipo ya cuenta con Apple Developer Program, licencia Apple, App Store Connect, EAS/Expo, Supabase, dominio y páginas legales.

No crees desde cero los recursos que ya existen. Audita y reutiliza:

- Bundle ID principal;
- Bundle IDs de extensiones;
- App Groups;
- Family Controls;
- Device Activity;
- Shield Configuration;
- Shield Action;
- TestFlight;
- perfiles EAS;
- certificados;
- provisioning profiles.

Las tareas pendientes prioritarias son:

- validar y conectar APNs/Push Notifications;
- implementar notificaciones locales y remotas en iOS;
- redactar los textos de privacidad requeridos por Apple;
- preparar App Privacy y toda la metadata de App Store Connect;
- preparar descripción, keywords, clasificación por edad, export compliance, iconos, splash, screenshots, URLs legales y notas de revisión.

No regeneres ni reemplaces recursos Apple ya preparados sin comprobar su estado real. Documenta qué se reutilizó, qué se corrigió y qué sigue pendiente. No guardes certificados, claves ni secretos en Git.

Usa estos modelos por fase cuando Antigravity lo permita:

- Gemini 3.1 Pro: auditoría, arquitectura, contratos, conexión de App Groups y Bundle IDs existentes.
- Gemini 3.1 Pro: módulo Swift, Family Controls y autorización.
- Gemini 3.1 Pro: Managed Settings, Device Activity, Shield Configuration y Shield Action.
- Gemini 3.1 Pro: PIN, rescate, errores, reinicios, revocación y APNs.
- Gemini 3 Flash: Auth, Palabra, Comunidad, Perfil, i18n y UI compartida.
- Gemini 3.1 Pro: QA profundo, errores nativos, iPhone real, TestFlight, privacidad y metadata final.

Empieza con la auditoría y entrega primero la matriz de arquitectura, riesgos y plan de implementación. No modifiques código hasta terminar esa auditoría.
```
