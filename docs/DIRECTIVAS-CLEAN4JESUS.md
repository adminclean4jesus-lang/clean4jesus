# Directivas Clean4Jesus

## Incidente iOS 1.3.16: cierre nativo de arranque - 2026-08-04

- Correccion del gate de simulador (2026-08-08): el primer smoke Release no demostro un crash de la candidata Legacy. Maestro ejecutaba `clearState` y `clearKeychain`, lo que desinstalo `com.clean4jesus.app` antes de la asercion; la captura posterior era la pantalla de inicio y Maestro no encontro ningun crash del bundle. El smoke ahora conserva la instalacion limpia realizada por CI y un test prohíbe reintroducir esas opciones. Repetir el gate completo antes de atribuir cualquier resultado a la app.

- Las builds 4 a 7 comparten la misma frontera de fallo de React Native Nueva Arquitectura: una `NSException` de un TurboModule `void` llega a `ObjCTurboModule::performVoidMethodInvocation`; en las builds 5 a 7, `convertNSExceptionToJSError` accede a Hermes desde la cola nativa y termina en `EXC_BAD_ACCESS`. El patrón coincide con el defecto abierto `react-native#53960` para RN 0.81.x. No seguir corrigiendo fuentes, timers, providers, Family Controls ni credenciales como causa de este incidente.
- Corrección candidata: Legacy Architecture exclusivamente en iOS mediante `expo-build-properties`; Android conserva `newArchEnabled=true`. Reanimated queda en 3.19.5, compatible con RN 0.81 en Paper y Fabric, y se retiran Worklets/NativeWind no usados para que iOS Legacy pueda compilar.
- Gate automático `tests/unit/iosArchitectureSafety.test.ts`: debe comprobar iOS Legacy, Android New Architecture, Reanimated 3.19 y ausencia de Worklets/NativeWind. No eliminar ni debilitar este contrato.
- Evidencia local posterior al cambio: TypeScript PASS, 168/168 unitarias PASS, Expo Doctor 17/17 PASS, export Hermes iOS PASS y `:app:compileDebugKotlin` Android PASS. Windows no puede generar ni ejecutar el proyecto nativo iOS; estas pruebas reducen riesgo pero no demuestran por sí solas que el iPhone ya abre.
- Veredicto de release vigente: `NO-GO` para producción y TestFlight. Antes de otra submission se exige compilar y abrir una app Release de simulador en macOS y una canaria interna en el mismo iPhone XS; el iPhone debe superar 20 aperturas en frío y 10 en caliente, online/offline y con/sin sesión persistida. Solo entonces autorizar una nueva build de producción.
- EAS Workflows con Maestro fue evaluado y no ejecutado porque la cuenta actual exige plan pago para el job Maestro. No gastar ni activar ese plan sin autorización expresa del CEO.

## Candidata iOS 1.3.16: Primer Refugio Real - 2026-08-04

- El crash real de TestFlight `1.3.16 (6)` ocurre aproximadamente 0,51 segundos después de abrir: `EXC_BAD_ACCESS/SIGSEGV` en el hilo JavaScript de Hermes (`TimerCallback`) mientras SecureStore consulta Keychain y Fabric monta la pantalla. La inspección del IPA firmado confirmó Family Controls y `group.com.clean4jesus.app` en la app y las tres extensiones; no regenerar credenciales por este incidente.
- La candidata `1.3.16 (7)` separa el control público de versión del cliente autenticado, monta catálogo y Auth solo después del gate, elimina en iOS la doble inicialización `getSession` + `INITIAL_SESSION`, y serializa las lecturas nativas del Refugio tras las interacciones iniciales. Android conserva su flujo de Auth. No declarar resuelto hasta abrir build 7 en el iPhone XS.
- El informe real de TestFlight `1.3.16 (4)` en iPhone XS registrÃ³ `SIGABRT` por una excepciÃ³n Objective-C en `com.meta.react.turbomodulemanager.queue`, inmediatamente despuÃ©s del control de versiÃ³n. No fue un fallo de firma ni de FontServices. La frontera nativa de Family Controls se ejecutaba en la cola asÃ­ncrona predeterminada de Expo Modules; `1.3.16 (5)` fuerza todas sus llamadas al hilo principal, que es el contexto seguro para UIKit y las APIs Screen Time. Esta es una hipÃ³tesis confirmable Ãºnicamente con la apertura real del iPhone; no afirmar que estÃ¡ resuelta hasta probarla.

- La build `1.3.15 (3)` terminó correctamente en EAS el 4 de agosto de 2026 y queda como diagnóstico aislado de arranque; su snapshot no contiene el trabajo local de `1.3.16 (4)`.
- `1.3.16` usa únicamente APIs oficiales de Screen Time: filtro adulto `ManagedSettings`, límite diario `DeviceActivity` y Shield de Clean4Jesus. No lee texto, hashtags, búsquedas, URLs ni pantallas de otras apps.
- Los targets `Clean4JesusDeviceActivityMonitor`, `Clean4JesusShieldConfiguration` y `Clean4JesusShieldAction` se generan con `@bacons/apple-targets` desde `targets/`; no editar un `ios/` generado como fuente de verdad.
- App Group oficial preparado: `group.com.clean4jesus.app`. Bundle IDs de extensiones: `com.clean4jesus.app.DeviceActivityMonitor`, `com.clean4jesus.app.ShieldConfiguration` y `com.clean4jesus.app.ShieldAction`.
- Antes de pedir otra build, registrar esos tres identificadores en Apple Developer, asignar Family Controls (Distribution) a cada uno y regenerar provisioning. La aprobación del App ID principal no cubre automáticamente las extensiones.
- Activar o pausar el límite exige el PIN local. El PIN agrega fricción dentro de Clean4Jesus, pero no impide que el propietario adulto desinstale la app o revoque permisos desde Ajustes.
- El botón principal del Shield deja una señal local para abrir el rescate de 60 segundos la próxima vez que se abra Clean4Jesus y cierra la superficie protegida. El SDK Xcode actual de EAS no expone la respuesta que abriría directamente la app contenedora; no reintroducir esa llamada hasta compilar y probar con un SDK que la incluya. Validar este fallback en iPhone XS.
- No modificar Refugio Android, VPN, Accesibilidad, PIN Android, reglas, bancos, YouTube, Comunidad, Palabra, Planes, Auth, footer, modo oscuro ni sus checkpoints durante esta candidata.

## Checkpoint iOS: Arranque Seguro - 2026-07-27

- La prueba real de TestFlight `1.3.15 (3)` en iPhone XS volvió a cerrarse inmediatamente después de mostrar “Checking your version”. La submission EAS de esa build fue cancelada el 4 de agosto de 2026; no volver a enviar ese binario a Apple.
- La corrección de `1.3.15` no fue suficiente: enlazar la fuente de iconos mediante el config plugin sigue siendo una ruta de registro nativo de fuentes. El crash anterior ocurre en FontServices, por lo que esta familia se considera no segura para el arranque en el dispositivo afectado hasta contar con evidencia contraria.
- La candidata local `1.3.16` elimina el plugin y dependencias directas de fuente/iconos y sustituye el componente de iconos por SVG locales, sin `Font.loadAsync`, import de `@expo/vector-icons`, asset TTF ni registro de fuente. La prueba `iosStartupFontSafety` protege las cuatro prohibiciones.
- No lanzar otra build ni submission hasta repetir TypeScript, pruebas unitarias, config Expo y una revisión del diff; la apertura real en iPhone XS sigue siendo un gate obligatorio antes de afirmar que el crash está resuelto.
- El segundo build TestFlight `1.3.14 (2)` confirmó que la carga restante no venía de las fuentes editoriales: `@expo/vector-icons` registraba `MaterialCommunityIcons.ttf` mediante `expo-font` al montar los primeros iconos.
- La corrección `1.3.15 (3)` enlazó Material Community Icons en el build nativo de Expo, pero quedó invalidada por la prueba real. No reintroducir imports directos de `@expo/vector-icons`, plugins de fuentes ni fuentes de iconos sin una prueba real en iPhone XS.

- El primer build TestFlight `1.3.13 (1)` llegó a App Store Connect pero se cerró al arrancar en un iPhone XS con iOS 18.7.9.
- El informe `.ips` confirmó `EXC_BAD_ACCESS` durante el parseo nativo de fuentes de `expo-font` en la cola asíncrona, no un fallo de Family Controls, Supabase, autenticación ni el módulo Swift.
- La corrección `1.3.14 (2)` elimina la carga dinámica de fuentes en el arranque. Mantenerla fuera del `RootLayout`; para recuperar fuentes personalizadas en iOS se deberán incrustar mediante el config plugin oficial de Expo y validarlas primero en iPhone real.
- Esta corrección no autoriza cambios al Refugio Android, VPN, Accesibilidad, PIN, reglas de bloqueo, banca, YouTube ni footer.

Este documento es memoria operativa del proyecto. Antes de modificar la app, leer este archivo y actualizarlo con aprendizajes nuevos al terminar la sesion.

## Checkpoint Legal Y Privacidad - 2026-07-23

- El sitio `legal.clean4jesus.com` usa el look and feel oficial de Clean4Jesus: logo `icon.png`, Lexend para titulares, Inter para lectura, azul marino/dorado y footer con copyright y `soporte@clean4jesus.com`. No volver a mostrar el nombre personal del responsable en el footer público.
- El wordmark legal usa `Clean` y `Jesus` en azul; el `4` es blanco con contorno azul. Mantener este tratamiento salvo decisión explícita de marca.
- La privacidad publicada esta en version 1.1; Terminos, Reglas de Comunidad, Seguridad Infantil, Eliminacion de Cuenta y Soporte siguen en version 1.0 en `legal.clean4jesus.com`.
- Supabase conserva consentimiento legal versionado y ejecuta retencion automatica diaria: falsos positivos a 12 meses y moderacion/auditoria a 24 meses.
- Comunidad exige aceptacion vigente y se mantiene para mayores de 18 anos durante la beta. Refugio y Palabra pueden usarse localmente sin cuenta.
- No cambiar versiones, plazos, contactos ni audiencia sin revision explicita de Producto, Seguridad/Privacidad y Legal.
- Esta base habilita iOS y una beta cerrada, no una publicacion abierta. Antes de publicidad siguen pendientes buzones reales, revision de abogado colombiano, licencias biblicas, declaraciones de tiendas y prueba documentada de eliminacion.

## Checkpoint De Correo Operativo - 2026-07-23

- Cloudflare Email Routing esta configurado para `clean4jesus.com`.
- Las direcciones `soporte@clean4jesus.com`, `privacidad@clean4jesus.com` y `seguridad@clean4jesus.com` reenvian a `adminclean4jesus@gmail.com`.
- Se verifico la recepcion de las tres direcciones con pruebas externas.
- Esto es reenvio a una bandeja Gmail, no tres buzones Gmail independientes. No cambiar estas reglas sin una razon operativa concreta.
- La cuenta destino debe mantenerse protegida con 2FA y filtros/etiquetas separados para cada direccion.

## Eficiencia De Trabajo

- Mantener la misma calidad tecnica y de producto usando la menor cantidad razonable de tokens, tiempo y llamadas a herramientas.
- **Graphify obligatorio primero:** antes de buscar, inspeccionar o volver a investigar cualquier aspecto del repositorio, consultar `graphify-out/graph.json` mediante `graphify query` con una pregunta estrecha y un presupuesto bajo. Reutilizar ese resultado; ampliar el presupuesto, leer archivos o ejecutar herramientas adicionales solo si el grafo no responde la duda concreta. Actualizar el grafo incrementalmente solo cuando cambie materialmente la arquitectura o el usuario lo solicite.
- Leer primero estas directivas y reutilizar el contexto ya comprobado; no repetir auditorias, busquedas, builds ni lecturas completas sin una razon concreta.
- Investigar en paralelo cuando sea posible, limitar la salida de herramientas a lo necesario y resumir hallazgos en vez de volcar logs extensos.
- Comunicar avances y resultados de forma breve, clara y accionable. Ampliar detalles solo cuando ayuden a decidir, diagnosticar un fallo o documentar un riesgo.
- La eficiencia nunca justifica omitir QA, seguridad, checkpoints, pruebas en Android ni controles obligatorios antes de entregar un APK.

## Equipo Virtual Persistente

- El consejo experto vive en `../.agents/skills/clean4jesus-executive-team/` y debe conservarse entre sesiones.
- No son procesos autonomos ejecutandose en segundo plano. Son mandatos persistentes que se convocan como subagentes independientes cuando una decision requiere su especialidad.
- Roles disponibles: Product Lead, Engineering/QA Lead, Software Architect, Tech Lead, Security & Privacy, Editorial/Theological, Trust & Safety, User Support, Growth, Operations/Reliability, Legal & Finance Operations, Product Legal Counsel y Product Designer.
- Las identidades, personalidades y preguntas criticas del equipo viven en `../.agents/skills/clean4jesus-executive-team/references/personas.md`; mantenerlas consistentes entre sesiones y no fingir que son personas reales o profesionales acreditados.
- Convocar solo los roles necesarios para ahorrar tiempo y tokens. Releases, permisos, datos sensibles, comunidad y decisiones irreversibles usan la matriz obligatoria del consejo.
- El consejo debe ser adversarial y registrar disensos. Security, Trust & Safety, Legal Counsel y Engineering/QA pueden declarar `NO-GO` dentro de sus dominios.
- El usuario es CEO y conserva la decision final, pero una decision ejecutiva no convierte automaticamente un riesgo tecnico, legal o de seguridad en resuelto.
- Los agentes no despliegan, borran datos, gastan dinero, aceptan contratos ni publican en tiendas sin autorizacion explicita.

## Producto

- Nombre publico: **Clean4Jesus**. Usarlo exactamente asi en UI, documentacion, splash, tabs y textos.
- Tono: cristiano, calido, motivador y concreto. Evitar lenguaje clinico, generico o de dashboard empresarial.
- Primer objetivo del MVP: que la app abra siempre, que el usuario entienda el estado del escudo y que pueda registrar habitos/devocional sin friccion.
- La experiencia base es "escudo primero": el usuario activa la proteccion y solo entonces entra al resto de la app.
- Objetivo de lanzamiento: Clean4Jesus debe publicarse para Android y iOS. Se busca paridad funcional y de experiencia, no copiar literalmente la implementacion nativa: Android usa sus APIs de VPN/Accesibilidad e iOS debera usar exclusivamente las APIs y capacidades permitidas por Apple.
- No prometer que iOS puede replicar `AccessibilityService` de Android. Antes de implementar el bloqueo en iOS, validar capacidades, entitlement, revision de Apple y limites reales de Family Controls, Network Extension y Managed Settings.
- Checkpoint de preparación iOS del 25 de julio de 2026: interfaz, navegación, Palabra, Comunidad, Perfil, idiomas, login por correo y contratos de permisos están preparados para la capa compartida. La ruta `/ios-readiness` comunica el estado real; Family Controls, APNs, OAuth iOS, extensiones Swift y TestFlight siguen pendientes hasta contar con Apple Developer activo y evidencia en un iPhone real.
- El contrato `src/features/iosProtection/iosProtectionContract.ts` no es una implementación nativa ni autoriza protección simulada. Conectar sus métodos solo después de crear el App Group, targets Swift y entitlement aprobados por Apple.
- Diferenciadores aprobados para el siguiente ciclo: Rescate de 60 segundos, reporte privado de falsos positivos y resumen semanal de acompanamiento sin historial de navegacion.
- Widgets Android/iOS son parte del roadmap previo al lanzamiento, pero no deben mostrar contenido sensible en pantalla bloqueada.

## Diseno

- Checkpoint Landing oficial corregido - 2026-07-25: la paleta pública usa azul marino, blanco y dorado; el verde lima queda rechazado porque no pertenece a la identidad aprobada de Clean4Jesus.
- La landing solo puede mostrar capturas reales de la aplicación. Queda prohibido inventar dashboards, estados, prácticas o funciones dentro de mockups. El teléfono puede construirse como marco de presentación, pero su pantalla debe ser una captura verificable y no puede quedar recortada.
- Checkpoint Hero de landing - 2026-07-25: la promesa principal debe expresar con claridad libertad frente a la pornografía, sin prometer curación clínica. Los marcos de teléfono deben conservar la captura completa, usar proporciones visualmente realistas y no llevar rótulos superpuestos sobre el producto.
- Regla de mockups reales - 2026-07-25: derivar la proporción del teléfono de la captura fuente (`1081x1999` en las capturas actuales), mostrarla en una sola pieza y usar `object-fit: contain` en galerías. No empalmar fragmentos, rellenar la pantalla, estirar la imagen ni usar `cover` cuando pueda recortar la UI. En galerías, cada captura debe tener margen superior y lateral simétrico; validar siempre en `393px` y `1440px`.
- La misión debe quedar respaldada temprano por cifras con población, contexto, fuente y enlace. No presentar asociaciones neurocientíficas como causalidad, diagnóstico o una división falsa entre “cerebro limpio” y “cerebro contaminado”.
- Palabra se comunica como devocional diario más un catálogo escalable de planes de distinta duración y futuros autores con revisión humana, teológica y editorial; nunca como un único ritmo fijo de siete días.
- Todo rediseño público requiere QA real en escritorio y móvil, control de desbordamiento, carga de imágenes, enlaces válidos y revisión visual antes del despliegue.

- Disenar como app movil primero; la web de Expo es solo una forma de probar.
- Usar Expo Router, React Native, React Native Paper, `@expo/vector-icons` y Reanimated.
- La direccion visual del reset debe sentirse premium, compacta y espiritual, no como dashboard generico.
- La navegacion activa del MVP es `Hoy`, `Camino`, `Habitos` y `Perfil`.
- La tipografia base de este reset es `Plus Jakarta Sans` para titulos y UI, con `Inter` para lectura larga.
- La UI debe respirar mas: menos texto por pantalla, cards compactas, jerarquia fuerte y espaciado consistente.
- La referencia Figma actual es `Fitness Tracker App (Community)`:
  - File key: `pvu9EGBsoJW1eyCpsLOBYr`
  - Frames leidos: `Activity`, `Feed`, `Food`
  - Patrones extraidos: fondo carbon `#252525`, acento lima `#C7F000`, tarjetas oscuras/blancas, metricas grandes, radios 13-17, cards compactas.
- Clean4Jesus adapta ese lenguaje asi:
  - Escudo = patron `Activity`
  - Devocional = patron `Feed`
  - Habitos = patron `Food Summary`
- No mezclar estilos claros anteriores con el sistema carbon/lima actual sin decision explicita.
- Revisar que no haya textos mojibake como `Ãƒ`, `Ã¢â‚¬Å“`, `Ã¢â‚¬`, `Ã°Å¸`.

## Escudo

- El toggle actual persiste estado local con AsyncStorage.
- Desde 1.2.0 existe una primera capa Android `VpnService` para DNS local. Desde 1.2.6 la base preferida es Cloudflare Family (`1.1.1.3`) para bloquear adulto sin forzar comentarios de YouTube fuera por modo restringido.
- La UI debe decir claramente si el modulo nativo esta pendiente.
- El escudo es la compuerta principal del producto: no abrir el resto de la app si no esta activo.
- La activacion debe guardar `shieldState` y `shieldEnabled`.
- Expo Go sirve para probar UI, habitos, devocional y navegacion. Para VPN, Accessibility Service y bloqueo real se necesita development build nativa.
- El proyecto fue bajado a Expo SDK 54 porque el celular del usuario instala Expo Go 54.0.8. No subir SDK sin confirmar compatibilidad de Expo Go o pasar a development build.
- Para el bloqueo nativo Android, seguir `docs/ANDROID-BLOQUEO-NATIVO.md`. No prometer cierre forzado real de apps sin root/device-owner; implementar sacar al usuario de la app bloqueada y mostrar interrupcion.
- Development build Android configurado con `expo-dev-client`, package `com.clean4jesus.app` y perfiles EAS en `eas.json`.
- Desde que existe `android/`, no volver a ignorar esa carpeta: ahi viviran `VpnService`, Accessibility Service y permisos nativos.

## Proteccion De Apps

- Refugio 2.0 puede sumar reglas por app sin romper el checkpoint 1.2.7: primero UI y reglas locales; despues cambios nativos controlados.
- La primera version de Proteccion de apps solo debe actuar sobre navegadores y redes sociales ya monitoreados por Accesibilidad. No ampliar a bancos, YouTube ni apps sensibles.
- Las reglas por app se guardan localmente y se sincronizan al servicio nativo con SharedPreferences. No requieren backend.
- Bloqueo total: al abrir una app marcada como vulnerable, mostrar la pantalla de interrupcion con motivo claro.
- Limite diario: usar conteo local aproximado mientras Accesibilidad esta activa. Para precision de producto futuro, evaluar `UsageStatsManager` y permiso de Acceso de uso.
- No prometer control perfecto de tiempo en pantalla hasta implementar y validar Usage Stats. La version actual es una capa practica y conservadora.
- Si una app queda bloqueada, debe existir una salida supervisada: desbloqueo temporal con PIN de guardian. El PIN idealmente lo guarda una persona de confianza, no el usuario en un momento vulnerable.
- Antes de permitir reglas en Proteccion de apps, debe existir PIN del guardian. No dejar que el usuario cree bloqueos sin una salida supervisada ya configurada.
- En la UI de Proteccion de apps, endurecer una regla no pide PIN; liberar una app si pide PIN. Ejemplos: Libre -> Bloquear no pide PIN; Bloqueada -> Libre pide PIN; Limitar -> Libre pide PIN; cambiar minutos dentro de Limitar no pide PIN, aunque suba de 30 min a 120 min.
- Si una accion de la UI cambia la regla de forma persistente, nombrarla como tal. No llamar "desbloquear" a una accion que en realidad pasa de bloqueo total a limite diario.
- El desbloqueo de 15 minutos se reserva para apps que el usuario bloqueo deliberadamente mediante Proteccion de apps; nunca se aplica automaticamente a una deteccion de contenido visible.
- Si el PIN confirma un falso positivo de contenido, permitir solo la huella local exacta de ese incidente durante 20 segundos. El Refugio sigue activo y cualquier contenido distinto vuelve a evaluarse.
- Las palabras sensibles deben coincidir por tokens completos, no como subcadenas dentro de otras palabras ni al unir limites visuales. Casos inocuos como `adultos`, `seguros` + `excursiones` no deben activar `adult` o `sex`.
- No crear aprendizaje automatico global con texto capturado. Los falsos positivos se corrigen localmente con huellas no reversibles; cualquier mejora compartida futura debe usar reglas revisadas y telemetria agregada sin texto, URL ni historial.
- Decision de producto del 25 de julio de 2026: `InterruptionActivity` permite capturas y grabacion de la interrupcion para documentar falsos positivos y compartir evidencia de QA. La pantalla advierte que una imagen personal puede quedar incluida. Al desplegar el panel del PIN, la Activity activa `FLAG_SECURE`; al cancelarlo o volver a la interrupcion, lo retira. No dejar el PIN capturable ni volver a bloquear las capturas de toda la interrupcion sin revision explicita de Producto y Privacidad.
- Las apps limitadas deben mostrar tiempo usado y tiempo restante del dia de forma visible. La version actual usa el conteo local aproximado de Accesibilidad; no venderlo como precision perfecta hasta evaluar UsageStatsManager.

## Habitos

- Las rachas dependen de la ultima fecha marcada.
- Marcar dos veces el mismo dia no debe duplicar racha.
- Marcar hoy y manana debe sumar 2.
- Saltar un dia debe reiniciar la racha diaria.
- Mantener tests unitarios para esta logica.

## Devocional

- El contenido debe sonar pastoral, personal y esperanzador.
- Cada pantalla debe tener un CTA claro: marcar lectura, activar escudo, marcar habitos.
- Si se amplia contenido, mantener estructura consistente y evitar textos superficiales.
- Desde el cierre del escudo 1.2.7, Palabra es el siguiente modulo principal: debe enfocarse en devocional diario, racha de lectura, oracion guiada y una practica concreta, sin mezclarlo con bloqueo tecnico.
- Los planes devocionales son local-first hasta que exista login. Deben guardar inscripcion y progreso en AsyncStorage, con estructura pensada para migrar a Supabase.
- Palabra debe soportar contenido escrito por el equipo, autores invitados o IA asistida, pero todo contenido publicado debe tener revision humana/editorial.
- Biblia completa no es prioridad del MVP. Primero usar referencias y versiculos seleccionados; si se agrega Biblia completa, validar licencia/traduccion antes de incluir texto.
- En planes devocionales, cada dia debe sentirse como lectura de 2-3 minutos: no textos superficiales. Debe incluir referencia biblica, reflexion cristocentrica sustanciosa, pregunta de aplicacion, oracion y practica concreta.
- Para Nueva Traduccion Viviente, usar referencias biblicas y etiqueta de lectura base; no copiar bloques extensos de texto NTV en el codigo sin validar permiso/licencia y credito legal para produccion.
- La UX de planes no debe mostrar los 7 devocionales completos en una sola pantalla. El plan debe tener portada/descripción, inscripción, checklist de días y una pantalla individual de lectura por día con CTA final para marcar terminado y volver al plan.
- Checkpoint Palabra/planes del 30 de junio de 2026: queda estable la arquitectura de planes local-first con portada, hilo conductor, inscripción, checklist, lectura individual por día, fecha local y CTA final. No volver a mostrar todos los devocionales completos dentro del detalle del plan.
- Checkpoint cierre del 30 de junio de 2026: Palabra/planes queda aprobado para prueba en APK debug/dev-client, con Refugio congelado sin cambios y politica de dos APKs activa.
- Checkpoint del 9 de julio de 2026, version 1.2.12: la base de notificaciones de Palabra queda aprobada. Mantener small icon Android, permiso del sistema, preview de recordatorio y limpieza de respuesta vieja al abrir desde notificacion.
- Checkpoint del 13 de julio de 2026, version 1.2.15: el footer persistente vuelve a quedar estable despues de la regresion visual introducida por motion en `1.2.14`. Mantener el footer con `safe area` manual y no volver a tocar su base sin prueba real en Android.
- Checkpoint del 13 de julio de 2026, version 1.2.16: la capa de motion queda aprobada solo con padding inferior dinamico por ruta y loading contextual dentro de tabs/planes. No volver a usar `paddingBottom` fijo global para convivir con el footer persistente.
- El rollback visual intentado en `1.2.17` no quedo aceptado por producto. Aunque se quitaron animaciones, la visual siguio rota: footer flotante mal distribuido, labels pegados, cards cortadas y textos truncados como `Ver pla`. No tomar `1.2.17` como checkpoint sano.
- Checkpoint del 14 de julio de 2026, version `1.2.18`: restaura la navegacion inferior como barra fija de ancho completo con cuatro columnas legibles y recupera el ritmo vertical de Palabra. Esta visual fue aprobada antes del APK y queda protegida por prueba E2E; no volver a convertir el footer en una capsula flotante ni a cambiar su distribucion sin previews aprobados y prueba real en Android.
- Checkpoint del 14 de julio de 2026, version `1.2.19`: se retira toda animacion ejecutable despues de las regresiones de motion. El footer usa una unica altura compartida entre barra y pantallas, y Planes/Comunidad tienen pruebas E2E contra texto truncado, columnas comprimidas y contenido escondido. No introducir animaciones ni cambiar la navegacion inferior sin una prueba Android real y una aprobacion visual explicita.
- Checkpoint del 14 de julio de 2026, version `1.2.20`: footer reconstruido con cuatro columnas de ancho explicito y labels contenidos; Planes pasa a un catalogo editorial de filas para evitar bloques repetidos o apiñados. No volver a usar una distribucion solo con `flex: 1` ni capsulas flotantes para el footer; cualquier cambio debe conservar la prueba de limites por columna y previews moviles aprobados.
- Checkpoint del 14 de julio de 2026, version `1.2.21`: el catalogo de Planes no puede depender de una fila flexible para repartir arte y texto porque Android puede reordenarla. Mantener arte anclado de forma absoluta, carril de texto reservado y prueba E2E de no solapamiento entre titulo e ilustracion.
- Checkpoint del 14 de julio de 2026, version `1.2.22`: los planes deben diferenciarse a primera vista por tono, borde, guia lateral y accion; no volver a mostrarlos como una lista monocroma de textos e imagenes intercambiables.

## Comunidad y login

- Comunidad requiere backend. Preferencia del stack: Supabase Auth + Postgres + RLS.
- Decision de producto del 19 de julio de 2026: los metodos de acceso son Google OAuth y correo con contrasena. No mostrar ni configurar Apple Login por ahora; el soporte futuro de iOS no depende de ofrecer ese proveedor.
- No guardar testimonios/comunidad solo en AsyncStorage si hay login real.
- Comunidad debe tener moderacion, reportes y lenguaje de apoyo, no de juicio.
- Inicio de fase 1.3 el 14 de julio de 2026: Supabase Auth, perfiles, publicaciones, apoyo en oracion, comentarios y reportes viven en modulos separados. No volver a perfiles falsos cuando falte backend; mostrar un estado honesto de configuracion pendiente.
- Toda tabla expuesta en `public` debe tener RLS habilitado y una prueba que lo verifique. Ninguna politica comunitaria puede confiar solo en validacion del cliente.
- La app movil solo recibe `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Nunca incluir `service_role`, secret key, password de base de datos ni token administrativo en Expo, Git o APK.
- El correo del usuario es privado y no se incluye en consultas del feed. El perfil publico se limita a nombre visible, ciudad opcional, biografia opcional, avatar y racha publica cuando aplique.
- Desde el 18 de julio de 2026 existe `runtime_gates` en Supabase para bloquear APKs incompatibles desde servidor. Cualquier subida del minimo soportado debe hacerse solo despues de probar el APK nuevo; no usar version gate para cambios cosmeticos o experimentales.
- El escudo, historial de bloqueo y progreso de Palabra siguen local-first. Crear una cuenta no debe subir historial sensible ni actividad de navegacion a Supabase.
- Reportar contenido es parte obligatoria del MVP comunitario. La moderacion administrativa y rate limiting son requisitos antes de abrir Comunidad al publico general.
- Conectar o modificar Supabase no autoriza cambios en footer, Planes ni Refugio; los checkpoints 1.2.24 permanecen congelados.
- Checkpoint de arquitectura `1.3.1` del 14 de julio de 2026: las sesiones moviles usan SecureStore y PKCE; confirmacion y recuperacion vuelven por `clean4jesus://auth/callback`; no regresar tokens a AsyncStorage salvo la migracion automatica de valores antiguos.
- La racha limpia es informacion sensible y permanece local. El rol `authenticated` no puede leer ni modificar `clean_streak` en Supabase.
- Usar grants por columna ademas de RLS. Un usuario no puede modificar `status`, `clean_streak` ni otros campos controlados por el sistema aunque altere el APK.
- Toda operacion que requiera `service_role`, como eliminar cuentas o moderar, vive en una Edge Function. La clave administrativa nunca entra en `src`, `app`, variables `EXPO_PUBLIC_*` ni APK.
- Antes de beta comunitaria son obligatorios SMTP propio, CAPTCHA, limites de Auth, moderacion operativa y la prueba real `npm run test:supabase:security` con dos usuarios temporales.
- Checkpoint Supabase `1.3.1` del 14 de julio de 2026: proyecto `moqlovsxklxcpihvheyc` desplegado en la organizacion `Emmanuel Lopez`; migraciones, Edge Function `delete-account`, asesores y prueba adversarial remota aprobados. No reemplazar el proyecto ni repetir la conexion sin una migracion o incidente documentado.
- Los proyectos Supabase ajenos a Clean4Jesus, incluido `Learning path TAAG Project`, no se modifican ni eliminan durante tareas de esta app.
- Checkpoint de seguridad `1.3.3` del 14 de julio de 2026: recuperacion ligada al evento real de Supabase, sesiones tolerantes a red, borrado con reautenticacion en servidor, RLS para identidades eliminadas y moderacion concurrente quedan aprobados por QA local y remoto. No simplificar estos contratos ni confiar nuevamente en validaciones exclusivas del cliente.
- En Ajustes, un perfil que no pudo cargarse no se trata como un perfil vacio: mostrar error con reintento y bloquear la edicion hasta recuperar datos confiables.
- La eliminacion de cuenta debe tener exclusion mutua inmediata en cliente, ademas del estado visual, para que dos pulsaciones del mismo frame no invoquen dos veces la Edge Function.
- El copy de eliminacion no promete anonimato total: los registros de moderacion pueden conservar copias de contenido, identificadores y decisiones de seguridad aunque desaparezca el perfil publico.
- Tras registro o intento de ingreso sin confirmar, mantener un estado visible con el correo destino, indicar que el enlace debe abrirse en este dispositivo y mostrar el resultado del reenvio dentro de la pantalla.
- Para operaciones y RLS sensibles no basta con que `auth.users` exista: validar tambien el `session_id` contra `auth.sessions`, porque un JWT revocado puede seguir criptograficamente vigente hasta `exp`.
- Una prueba de seguridad debe respetar el mismo minimo privilegio que exige al producto: el reportante crea el reporte, pero solo el rol administrativo verifica snapshots internos.
- No ejecutar `npm audit fix --force` dentro de un parche funcional: actualmente propone subir Expo de SDK 54 a 57. Tratar dependencias transitivas en una actualizacion de plataforma separada y probada.
- CAPTCHA de Auth usa Cloudflare Turnstile dentro de una pagina HTTPS en WebView y protege ingreso, registro y recuperacion. Mantener `EXPO_PUBLIC_AUTH_CAPTCHA_ENABLED=false` hasta que `verify.clean4jesus.com`, la site key publica y el secret de Supabase esten listos; nunca poner el secret en Expo ni en la pagina del reto.
- Activacion operativa de Turnstile: el cliente ya usa `EXPO_PUBLIC_TURNSTILE_SITE_KEY`, pero el secret del servidor vive solo en la terminal y se empuja con `npm run supabase:auth:push`, que exige `SUPABASE_AUTH_CAPTCHA_SECRET`. Nunca guardar ese secret en `.env.local`, `EXPO_PUBLIC_*` ni Git.
- La consola de moderacion vive separada en `moderation-console/` y usa solo URL + publishable key. La base exige rol privado activo antes de exigir MFA TOTP `aal2`; no devolver `moderator_mfa_required` a usuarios sin rol.
- Checkpoint de moderacion del 16 de julio de 2026: RPC v2 con MFA, revocacion de RPC antiguos, Edge Function actualizada, primera cuenta Emmanuel como `admin`, lint remoto limpio y pruebas adversariales remotas aprobadas. La consola esta publicada y verificada en `https://moderation.clean4jesus.com`; no mezclarla con el APK ni introducir claves administrativas en su bundle publico.
- La consola de moderacion esta protegida por el mismo Turnstile HTTPS de `verify.clean4jesus.com`. Toda operacion de Auth desde la consola, incluido ingreso y recuperacion de contrasena, debe enviar `captchaToken`; no desactivar CAPTCHA para resolver errores de correo. En Windows con Node 24, `scripts/push-auth-captcha.mjs` usa `cmd.exe` para evitar `spawn EINVAL`.
- Si un administrador abandona el enrolamiento MFA antes de verificar TOTP, la consola elimina unicamente el factor incompleto con nombre `Consola Clean4Jesus` y crea uno nuevo. Nunca eliminar factores MFA verificados ni factores de otro nombre automaticamente.

## Figma + Composio

- Composio MCP esta configurado y Figma aparece como conexion activa.
- Para leer disenos reales de Figma se necesita al menos una URL de archivo, `file_key`, `team_id` o `project_id`.
- No inventar que se importo un diseno de Figma si no se leyo un archivo real.
- Flujo correcto con Composio:
  1. `FIGMA_DISCOVER_FIGMA_RESOURCES` con URL o ID.
  2. `FIGMA_GET_FILE_JSON` con `depth` bajo.
  3. `FIGMA_GET_FILE_NODES` para frames concretos.
  4. Aplicar tokens/jerarquia visual a React Native.

## QA Obligatorio

Antes de decir que esta listo, ejecutar:

```bash
npx tsc --noEmit
npm run test:unit
npm run test:e2e
npx expo export --platform web --clear
```

Para pruebas en celular, seguir `docs/TESTING-CELULAR.md`.

## Red Team Antes De APK

- Antes de lanzar cualquier APK, desplegar dos revisiones adversariales separadas:
  - Subagente 1: Android/nativo/permisos/build. Debe intentar romper VPN, Accesibilidad, pantalla de interrupcion, allowlists, bancos/YouTube y empaquetado.
  - Subagente 2: UX/producto/regresion/datos. Debe intentar encontrar confusion de usuario, estados falsos, persistencia rota, textos engañosos, pantallas sin salida o regresiones de checkpoints.
- Los subagentes deben actuar como revisores adversariales, no como implementadores: buscar fallos, riesgos y contradicciones con estas directivas.
- Antes de generar el APK, responder a cada hallazgo con una decision: corregido, aceptado con razon, o falso positivo con evidencia.
- Si un hallazgo toca el checkpoint congelado del Refugio 1.2.7, no aplicar cambios automaticos. Primero justificar por que es necesario y limitar el cambio al minimo.
- No usar el APK como prueba de descubrimiento inicial. Primero red team, luego QA obligatorio, luego build.

## Builds Y Pantallazos

- Antes de lanzar cualquier build nuevo, mostrar primero pantallazos o previews de las pantallas afectadas.
- No pedir build a ciegas si el cambio es visual, de layout, de tipografia o de jerarquia.
- Si el usuario quiere ver "como se veria todo", preparar primero capturas o renders de las pantallas principales y luego lanzar el build.
- Si el cambio toca el look and feel completo, validar primero la pantalla de ingreso, la home, Camino, Habitos y Perfil como set minimo.
- Cuando el cambio sea pequeno y no afecte UI, se puede omitir preview visual y pasar directo a verificacion tecnica.
- Mientras el usuario no pida explicitamente "APK de produccion", "release" o "sin QR", cualquier pedido de "build" significa APK local/debug de pruebas con dev client y QR. No gastar tiempo intentando generar release standalone si no fue pedido.
- Regla permanente: queda prohibido usar `eas build` o entregar un artefacto remoto de EAS para pruebas. El flujo de pruebas debe ser siempre `C:\\c4j\\android\\gradlew.bat :app:assembleDebug --no-daemon --max-workers=1`, copiar la APK a `artifacts/apk/current` y entregar `npm run dev-client` para el QR. EAS solo se puede usar tras una petición explícita de APK de producción/release y confirmación del usuario.
- Para pruebas actuales, el camino preferido es `:app:assembleDebug` y luego `npm run dev-client` o `npm run dev-client:tunnel` para el QR. El release/produccion queda para una fase posterior mas madura.
- Siempre que se entregue un APK local al usuario, incluir en la misma respuesta el comando completo de `dev-client` desde la carpeta del proyecto para levantar Metro y mostrar el QR. Preferir `npm run dev-client`; usar `npm run dev-client:tunnel` si la red local falla.
- Politica de APKs locales: no acumular builds. Mantener maximo dos APKs en `artifacts/apk`: `current/Clean4Jesus-current.apk` y `previous/Clean4Jesus-previous.apk`. En cada build nuevo, mover current a previous, escribir el nuevo current y borrar cualquier otro `.apk` viejo.
- Al cerrar una sesion con APK local, verificar que `artifacts/apk` tenga exactamente esos dos APKs y que cualquier copia temporal de build, como `C:\c4j`, pueda borrarse si el APK ya fue copiado.

## Aprendizajes De Errores Previos

- No usar `localhost` sin puerto; Expo web debe abrirse con puerto explicito.
- En Windows, preferir `npm.cmd`/`npx.cmd` si PowerShell bloquea `npm.ps1`.
- Si Expo queda "cargando", comprobar listener de puerto y log antes de cambiar codigo.
- NativeWind puede romper web si se fuerza color scheme con dark mode tipo `media`; mantener `darkMode: "class"` y bootstrap controlado.
- No dejar UI con caracteres corruptos; eso degrada la confianza del usuario.
- No prometer servidor vivo si el proceso no queda escuchando. Verificar con HTTP 200 o usar una terminal visible.
- En Google Pixel 9, probar que ningun texto se corte en tabs, header, hero card y estado del escudo. Usar `flexShrink`, labels cortos, scroll con padding inferior amplio y componentes compactos.
- El PIN debe verse en Android: no confiar solo en `secureTextEntry`; usar color de texto oscuro sobre inputs claros y dots visibles. Al crear PIN desde activar escudo, debe guardar PIN, activar estado local y volver a tabs.
- El refugio solo cuenta como realmente activo cuando `enabled` y `setupComplete` estan en true; no debe abrir tabs por un estado viejo o parcial guardado en AsyncStorage.
- El flujo de activacion debe mostrar pasos claros y requerir confirmacion manual despues de configurar DNS privado y accesibilidad.
- Para bloqueo web inmediato en Pixel 9, guiar Private DNS con `family.cloudflare-dns.com`. Evitar `family-filter-dns.cleanbrowsing.org` por defecto porque puede forzar YouTube Restricted Mode y ocultar comentarios.
- La pantalla personalizada de bloqueo en Chrome no sale del DNS; depende de Accessibility Service. Ser honesto: puede sacar al usuario de Chrome y mostrar Clean4Jesus, no matar procesos ni inyectar HTML en HTTPS.
- La app debe decir explicitamente que no sube historial ni lee mensajes; la proteccion es local en el dispositivo.
- Cuando se amplie la cobertura de sitios adultos, usar una lista mantenible de hosts conocidos y senales de busqueda, no solo palabras sueltas como `xxx`.
- Mantener una exclusion minima para apps que no deben tocarse, especialmente YouTube y apps bancarias como Nubank.
- El bloqueador por accesibilidad queda acotado a navegadores y redes sociales; no debe tocar apps bancarias ni medios confiables.
- Los avisos automaticos de permisos solo deben mostrarse en Android nativo; en web y tests e2e pueden romper la carga o crear falsos fallos.
- El aviso de accesibilidad debe sonar humano y pastoral: explicar por que se pide el permiso, que Android mostrara una advertencia normal y que la proteccion sigue siendo local.
- En Playwright + Expo web, evitar `--clear` en el webServer por defecto; hace que el bundle frio tarde demasiado y puede falsear los smoke tests.
- El roadmap vivo del proyecto debe mantenerse en `docs/ROADMAP-CLEAN4JESUS-2026-06-15.md` y actualizarse al cerrar hitos grandes.
- Antes de iniciar cualquier tarea, leer primero estas directivas y el roadmap vivo; no tocar codigo ni docs sin esa lectura previa.
- Si algo ya funciona y no esta en el pedido actual, no modificarlo. La estabilidad tiene prioridad sobre cambios cosméticos o "aprovechar" para refactorizar.
- Tratar cada avance que funcione como un checkpoint: se documenta, se conserva y no se pisa en sesiones posteriores salvo que el usuario lo pida de forma explicita.
- Cuando aparezca un nuevo falso positivo o exclusion sensible, resolverlo por criterio y allowlist, no con excepciones aisladas improvisadas.
- La allowlist debe pensar por categoria: servicios financieros, medios confiables y apps de sistema sensibles primero; luego aplicar heuristicas de riesgo sobre contenido adulto.
- El bloqueo por accesibilidad debe cubrir Chrome, Telegram, TikTok y apps similares cuando el texto accesible exponga senales adultas.
- Las apps bancarias y servicios sensibles deben ir en una allowlist amplia para reducir falsos positivos y evitar que el usuario vea alertas innecesarias.
- YouTube y sus variantes quedan dentro de la categoria de medios confiables y no deben bloquearse por comentarios ni por analisis agresivo si el paquete es confiable.
- "Cerrar app bloqueada" es una salida best-effort: enviar Back/Home para sacar la app del frente, no terminar procesos como root.
- Para este reset, evitar cards gigantes y titulares excesivos; la version ganadora se siente mas calmada, mas sofisticada y mas compacta.
- Al iniciar cualquier nueva tarea, leer primero esta directiva y tambien el roadmap vivo antes de tocar codigo, docs o builds.
- Si una indicacion del usuario contradice una mejor practica clara, proponer la mejora con respeto y explicar por que conviene; no seguir ciegamente una instruccion que empeore UX, seguridad o mantenibilidad.
- Al cerrar sesion, limpiar automaticamente todo lo temporal y regenerable del proyecto: previews, artefactos, caches de build, capturas viejas y archivos intermedios que no aporten valor al siguiente turno.
- Mantener una carpeta `tmp/` para material transitorio entre sesiones cuando haga falta; todo lo que viva ahi debe ser efimero y quedar fuera del camino principal del proyecto.
- Cada sesion debe dejar aprendizaje nuevo escrito aqui: decisiones de UX, problemas resueltos, limites tecnicos y atajos validos para no repetir errores.
- El QR correcto para probar en el telefono es el que imprime `npm run dev-client` o `npm run dev-client:tunnel` en una terminal normal, no el QR de la pagina del build de EAS.
- Si el telefono intenta conectar a `127.0.0.1` o `localhost`, casi siempre se esta usando un QR viejo, un servidor duplicado o una URL de development build equivocada; cerrar servidores extra y volver a generar el QR.
- Para evitar confusion, dejar un solo Metro/dev client activo por sesion y usar tunnel si la red local o el puerto 8081 generan conflictos.
- Al cerrar sesion, borrar tambien QR temporales, screenshots de preview y artefactos regenerables que solo sirvieron para validacion de esa ronda.
- En Android, `Alert.alert` solo es buena idea para 3 acciones maximo; cualquier confirmacion final importante debe vivir en la pantalla, no escondida como cuarto boton.
- Antes de pedir un nuevo build, comprobar en el flujo real del telefono que el boton final de confirmacion este visible y que el estado pase de preparado a activo.
- La pantalla de interrupcion debe explicar el motivo del bloqueo con una frase concreta basada en el disparador detectado, no solo un mensaje espiritual generico.
- El servicio de accesibilidad debe enviar el motivo al `InterruptionActivity` para que el usuario entienda si fue una busqueda, un dominio o una senal sensible.
- La pantalla de interrupcion nativa debe lanzarse inmediatamente al detectar la senal y no despues de mandar Home; si se manda Home antes, la interrupcion se oculta y el usuario la ve solo al volver desde recientes.
- `InterruptionActivity` debe usar una estetica nueva, limpia y calma, con fondo claro, cards compactas, tipografia distinta al resto del sistema viejo y el logo correctamente centrado.
- El boton "Cerrar app bloqueada" sigue siendo best-effort, pero debe vivir como accion manual dentro de la pantalla de interrupcion, no como paso automatico previo a mostrarla.
- En Android nativo, usar `setShowWhenLocked` y `setTurnScreenOn` en la pantalla de interrupcion cuando el flujo necesite sentirse inmediato.
- El bloqueo debe decidir por criterios, no por casos sueltos: primero confiar en una allowlist por categoria (bancos, YouTube y servicios sensibles), luego evaluar apps observadas por riesgo, y solo bloquear cuando haya senales claras de contenido adulto.
- Cuando aparezca una exclusion nueva, documentar el criterio que la justifica; no crear excepciones aisladas sin una razon de producto.
- Cada version del bloqueo debe conservar lo que ya funciona y registrar el nuevo cambio como checkpoint versionado; no reescribir el comportamiento estable salvo que el usuario lo pida.
- La version 1.1.1 debe dejar como regla que el bloqueo viva solo en navegadores y redes sociales; si el usuario abre Nubank o YouTube, la app no debe interferir.
- Desde la version 1.1.2, esa regla debe existir tambien en el XML nativo del Accessibility Service con `android:packageNames`; no basta con filtrar en Kotlin.
- No declarar permisos sensibles que no se usen. Si la interrupcion es una Activity nativa, no pedir `SYSTEM_ALERT_WINDOW`.
- Evitar `flagRetrieveInteractiveWindows` salvo que exista una razon tecnica demostrada; aumenta la huella percibida del servicio.
- YouTube queda como checkpoint funcional desde 1.1.2: comentarios visibles y fuera del alcance del bloqueador. No tocarlo salvo que el usuario pida especificamente trabajar YouTube.
- Para apps bancarias, si el banco bloquea cualquier servicio de accesibilidad activo, no insistir con allowlists. Usar Modo banca: guiar al usuario a pausar Clean4Jesus en Accesibilidad, usar el banco y reactivar la proteccion.
- Modo banca debe ser por categoria, no por Nubank: aplica a bancos, billeteras y apps financieras que tengan politicas agresivas contra accesibilidad.
- Modo banca dentro de la app tiene demasiada friccion para transferencias rapidas; la arquitectura preferida es un atajo del sistema para pausar/reactivar accesibilidad sin abrir Clean4Jesus primero.
- Android permite que el propio AccessibilityService se desactive con `disableSelf()`, pero el encendido lo dispara el usuario desde Ajustes o atajos de accesibilidad del sistema. No prometer reactivacion automatica invisible.
- Para banca, priorizar un flujo de baja friccion: ensenar a configurar el atajo de accesibilidad de Android y/o crear un acceso rapido/Quick Settings tile que pause Clean4Jesus antes de abrir bancos.
- La accesibilidad no usa popup runtime como camara/ubicacion. La app puede mostrar un modal educativo y abrir Ajustes, pero Android exige confirmacion del usuario en la pantalla de accesibilidad.
- Arquitectura elegida para banca: dos capas. VPN/DNS debe ser el escudo base; Accesibilidad solo es la capa de interrupcion visual para navegadores/redes. Si Accesibilidad se pausa por banca, VPN/DNS debe seguir protegiendo.
- Desde 1.2.1 el onboarding del refugio debe invocar la VPN local; no esconder la activacion VPN solo en Ajustes, porque el usuario espera el permiso durante la configuracion inicial.
- Nubank no se arregla solamente activando VPN si Accesibilidad sigue activa. La VPN es la capa base; el conflicto bancario existe mientras el servicio de accesibilidad siga encendido.
- Desde 1.2.2 el modo banca debe intentar pausar la capa de Accesibilidad con `disableSelf()` y dejar VPN local activa. Esta es la forma practica de entrar a bancos sin desmontar el escudo base.
- La UI del refugio debe mostrar checks por capa: PIN, VPN local, DNS y Accesibilidad. No volver a mostrar 100% si alguna capa esta pendiente.
- No tocar el servicio de Accesibilidad ni su XML cuando se trabaje en VPN/DNS, salvo que el usuario pida explicitamente cambiar la pantalla de interrupcion o reglas de redes/navegadores.
- Cuando el bloqueo detecte una senal adulta, debe intentar sacar la app bloqueada del frente antes de mostrar la interrupcion, dejando el bloqueo como salida best-effort sin matar procesos.
- La salida best-effort no debe ejecutar `HOME` despues de lanzar `InterruptionActivity`; primero cerrar/sacar la app bloqueada y luego abrir la pantalla de interrupcion para que quede visible.
- Para builds locales en Windows, si la ruta de OneDrive rompe Gradle por longitud, construir desde una ruta corta temporal y usar JDK 17; no tocar el codigo solo por el entorno.
- Para APKs locales de prueba, la ruta corta vigente y validada es `C:\\c4j` con `:app:assembleDebug`. No volver a intentar empaquetado pesado desde la ruta larga de OneDrive si ya sabemos que Gradle/CMake puede romper por longitud.
- La allowlist sensible debe cubrir prefijos reales de paquetes confiables, no solo coincidencias sueltas de nombre. YouTube y Nubank deben quedar exentos por categoria y por prefijo estable cuando corresponda.
- En Android, el launcher usa adaptive icons y recorta con mascara distinta segun fabricante. No calibrar el icono para un Pixel especifico: usar fondo full-bleed separado y `foreground` transparente centrado dentro de zona segura conservadora. Para este logo, el simbolo debe ocupar aprox. 49-55% del lienzo de 1024px, no 60-65%, para que circulo, squircle y rounded-square no lo corten ni lo vean pegado.
- YouTube como checkpoint tambien depende del DNS: CleanBrowsing Family puede forzar YouTube Restricted Mode y ocultar comentarios. La correccion preferida es Cloudflare Family como DNS base, manteniendo Accesibilidad como en el checkpoint probado.
- Desde 1.2.7, DNS privado manual no es parte del flujo principal. La activacion normal del refugio son tres capas: PIN, VPN local y Accesibilidad. DNS privado queda solo en Ajustes avanzados con disclaimer porque puede afectar datos moviles o YouTube.
- Checkpoint congelado: el 30 de junio de 2026, version 1.2.7, el escudo/refugio queda como se necesita: bloqueo funcionando, pantalla de interrupcion funcionando, YouTube y bancos sin interferencia, flujo principal sin DNS privado obligatorio. No cambiar logica nativa, reglas de bloqueo, VPN, Accesibilidad, pantalla de interrupcion ni allowlists salvo instruccion explicita del usuario.
- Modo banca dentro de Ajustes se elimina del producto visible desde este checkpoint porque ya no se necesita en el flujo actual. Si vuelve el problema bancario, investigar primero sin reabrir esa UI.
- Antes de entregar un APK al usuario, correr preflight de producto: dos revisiones adversariales, QA obligatorio, recorrido funcional minimo de la pantalla tocada y luego build. El APK es para probar valor, no para descubrir errores obvios de semantica o salida.
- Si cambia Proteccion de apps, revisar siempre tres cosas antes del build: salida supervisada con PIN ya configurado, copy que describa el efecto real de cada accion, y estado "listo" que signifique aplicado en Android y no solo guardado localmente.
- Para notificaciones en Android, crear primero el notification channel y despues pedir el permiso. No disparar `requestPermissionsAsync()` antes de esa secuencia.
- Si la prueba de notificaciones es local al mismo dispositivo, llamarla `notificacion de prueba` o `prueba local`; no venderla como push real hasta tener token, backend y envio remoto.
- Cuando una pantalla abra ajustes del sistema para permisos, al volver debe refrescar el estado visible en foco. No mostrar `Permitido` o `Lista` con datos viejos.
- El permiso de notificaciones no debe interferir con el checkpoint congelado del Refugio. Si se pide automaticamente, debe ocurrir ya dentro de la zona principal de la app y no durante el gate tecnico del escudo.
- Si se usa `getLastNotificationResponseAsync()` para deep links de notificaciones, limpiar la ultima respuesta despues de navegar; si no, una respuesta vieja puede reabrir rutas al siguiente arranque.
- El small icon de Android para notificaciones debe ser un asset monocromo dedicado, no el launcher icon completo. Validar siempre `app.json`, `AndroidManifest.xml` y el drawable nativo juntos.
- El proyecto debe tener siempre un `README.md` util y actualizado; sin eso no se considera un repo profesional ni listo para handoff.
- Antes de cualquier build o release, sincronizar version en `package.json`, `app.json`, version visible en UI y `android/app/build.gradle`. No volver a dejar fuentes desalineadas.
- El PIN del guardian no debe vivir en texto plano dentro de AsyncStorage. La politica vigente es hash SHA-256 + almacenamiento seguro local y sincronizacion nativa del hash, no del valor en claro.
- Los QR PNG y otros artefactos de validacion no se conservan. En `artifacts/` solo deben sobrevivir los dos APKs locales permitidos.
- La profesionalizacion del repo tambien es parte del producto: `.gitignore`, checklist de release, onboarding tecnico y limpieza de temporales no son opcionales.
- Checkpoint de producto en `Palabra` para 2026-07-13, version `1.2.13`: mantener la logica de planes dia por dia, el recordatorio que lleva al dia sugerido y el feed de Comunidad renovado. A partir de aqui, mejorar por capas sin volver a una UX plana o mostrar todos los dias del plan de golpe.
- Checkpoint visual del 13 de julio de 2026, version `1.2.14`: quedan aprobadas las animaciones base de carga, entrada suave y banner de completado del Refugio. Desde aqui, cualquier motion nuevo debe ser calmado, elegante y no invadir el flujo ni tocar el checkpoint funcional del escudo.
- Cierre del 14 de julio de 2026: la fase de animacion se considera fallida a nivel visual. En la proxima sesion la prioridad absoluta es volver al layout previo al motion en Android real y corregir, antes de cualquier feature nueva, estos puntos: `footer/tab bar` fijo y no flotante, labels con espacio correcto, cards y CTAs sin cortes, y encabezados completos como `Ver planes`. No reintroducir motion hasta que ese baseline vuelva a quedar sano.
- Remediacion visual del 14 de julio de 2026, pendiente de aprobacion de producto: el footer debe ser una barra fija a borde completo, con cuatro columnas flexibles y labels de una linea; no una tarjeta flotante. El contenido de cada pantalla reserva un unico padding inferior calculado por `Screen`. La regresion se cubre con `tests/e2e/persistent-tab-bar.spec.ts`, que valida los cuatro destinos, el borde inferior y el CTA `Ver planes` en viewport movil.
- En `Palabra`, las secciones de la vista `Hoy` deben vivir en un contenedor con ritmo vertical explicito; no apilar hero, aplicacion, CTA y planes en un `View` sin `gap`. El texto de reflexion de la home es un extracto corto (maximo cuatro lineas); la lectura larga vive en los planes.
- Resultado real de `1.2.23` en Android: Planes queda aprobado, pero el footer no. No volver a tocar el catalogo de Planes durante esta correccion.
- En Android, no repartir el footer persistente con `flexBasis`/`flexGrow`, `useWindowDimensions`, anchos dinamicos dentro del callback `style` de `Pressable` ni depender de que una prueba web reproduzca Yoga/Fabric. El contenedor ocupa `left: 0` y `right: 0`; sus cuatro destinos se anclan como cuadrantes absolutos contiguos `0-25-50-75%`. Mantener una prueba de contrato que impida restaurar el patron fallido y validar siempre 320, 360, 393 y 412 dp.
- El catalogo de Planes aprobado en `1.2.23` mantiene arte, texto y accion en flujo vertical normal. Ese layout es checkpoint y no debe cambiarse al corregir el footer.
- Checkpoint aprobado en Android real el 14 de julio de 2026, version `1.2.24`: footer fijo de ancho completo con cuatro cuadrantes absolutos contiguos y catalogo de Planes en flujo vertical. No modificar la geometria del footer ni el layout del catalogo sin solicitud explicita y nueva validacion en Android.
- Checkpoint backend `1.3.2` del 14 de julio de 2026: moderacion usa roles, casos y auditoria en esquema `private`; el actor siempre se deriva de `auth.uid()` y nunca llega como identificador confiado desde el cliente.
- Toda accion de moderacion exige version esperada e idempotency key. La evidencia se guarda como snapshot durable y no debe desaparecer al borrar contenido o una cuenta.
- Restaurar contenido requiere rol `admin` y sesion MFA `aal2`; un moderador normal puede reclamar, ocultar o resolver sin accion, pero no restaurar.
- Los dos avisos del Security Advisor sobre RPC `SECURITY DEFINER` de moderacion son excepciones conscientes: mantienen verificacion interna de rol privado y se cubren con pruebas negativas. No reemplazarlos por una `service_role` confiada desde el cliente o por actor IDs enviados por el usuario.
- SMTP propio esta activo y probado. Turnstile esta integrado en ingreso, registro y recuperacion, y el reto HTTPS esta publicado en `https://verify.clean4jesus.com/turnstile/`. Falta probar el cliente compatible en Android y solo despues activar CAPTCHA en Supabase; no habilitarlo antes porque bloquearia clientes antiguos sin WebView/token.
- Footer, Planes y Refugio permanecen congelados durante el trabajo de Supabase 1.3.x; no mezclar cambios backend con retoques visuales.
- Cierre QA `1.3.3` del 14 de julio de 2026: las pruebas locales y remotas aprobaron, pero el red team detecto riesgos preexistentes dentro del checkpoint de Refugio y pendientes de privacidad/moderacion en Comunidad. No generar una candidata APK hasta clasificarlos, corregirlos y repetir el preflight.
- Los conteos de apoyo en oracion no deben exponer la lista de identidades de otros usuarios. La app solo necesita el conteo agregado y saber si el usuario actual ya reacciono.
- `community_prayers` no admite lectura directa desde clientes autenticados. Consumir conteos de oracion y comentarios mediante `get_community_engagement`, que devuelve solo agregados y `prayed_by_me` para la sesion activa.
- No prometer `anonimizacion` cuando se conserva evidencia de moderacion con identificadores pseudonimizados. El copy legal y de producto debe describir honestamente la retencion.
- Un hallazgo adversarial sobre Refugio congelado no autoriza modificarlo automaticamente: documentar el riesgo y solicitar aprobacion explicita para un parche minimo.
- Desde `1.3.4`, los clientes no leen perfiles comunitarios ajenos ni `author_id`; el feed y los comentarios consumen RPC de identidad publica con `owned_by_me` y sin UUID estable.
- Los limites de uso basados en Accesibilidad deben acotar el tiempo entre eventos. Nunca asumir que una app observada sigue al frente durante horas si Android no entrega un evento de salida.
- La VPN local no puede reportarse activa indefinidamente si su DNS no responde: usar upstream familiar secundario y pasar a inactiva tras fallos consecutivos verificables.
- No ampliar `android:packageNames` para corregir medicion de uso: YouTube y banca permanecen fuera del alcance del servicio como checkpoint de privacidad y compatibilidad.
- Checkpoint aprobado `1.3.4` del 15 de julio de 2026: registro, confirmacion, login, perfil y Comunidad real sobre Supabase funcionan correctamente en la APK interna. Conservar las RPC sin UUID, consentimiento explicito, SecureStore/PKCE, RLS, reportes y bloqueos contra carreras; no simplificar estos contratos.
- Una APK debug/dev-client no es autonoma: `npm run dev-client` usa la red local y deja de cargar al salir de esa Wi-Fi. `npm run dev-client:tunnel` permite probar desde otra red solo mientras el PC permanezca encendido, conectado a Internet y con Metro/tunnel abierto. Solo una APK release/produccion funciona sin Metro ni QR.
- Si CMake/Ninja falla en Windows con `Permission denied`, cerrar el daemon y los procesos CMake/Ninja ligados a `C:\c4j`, limpiar exclusivamente caches nativos de esa copia y reconstruir con `--max-workers=1`. Este flujo fue validado para `1.3.4`; evita modificar codigo por un fallo de infraestructura.
- El backlog ejecutivo hacia Play Store vive en `docs/ROADMAP-BETA-PLAYSTORE.md` y su visual compartible en `docs/assets/roadmap-beta-playstore.svg`. Mantenerlo actualizado cuando cambie el estado de beta, Play Store, Turnstile, legal, guardian o pantalla de bloqueo.
- La beta internacional debe contemplar espanol, ingles y frances. No traducir pantallas sueltas de forma manual: usar arquitectura `i18n`, persistir preferencia de idioma y migrar textos por modulos para proteger checkpoints visuales.
- Candidata interna `1.3.6` del 16 de julio de 2026: la Fase 1 de proteccion implementa PIN temporal por paquete, personalizacion local, vinculacion bilateral y alertas privadas. No declararla checkpoint definitivo hasta probarla en Pixel 9 y otro Android.
- Un cambio de PIN existente siempre exige el PIN vigente. El PIN del guardian tiene limite de cinco intentos y pausa de 30 segundos tanto en React Native como en la interrupcion nativa.
- Los permisos temporales nativos usan `SystemClock.elapsedRealtime()` y `BOOT_COUNT`; no volver a usar hora de pared para expiracion porque el usuario puede cambiarla.
- Una alerta de riesgo fallida no consume el cooldown. El servidor reserva el envio, marca entrega solo si Expo acepta al menos un ticket y permite reintento tras dos minutos.
- Las senales de riesgo se purgan tras 24 horas y los registros tecnicos de despacho tras 30 dias. Nunca guardar en ellos palabras, URL, paquete, motivo ni contenido visible.
- La personalizacion de interrupcion se confirma primero en Android y despues en almacenamiento JS; no dejar estados divididos donde Ajustes muestre una imagen que la pantalla nativa no pudo copiar.
- Al cerrar sesion, borrar la credencial nativa y cualquier cola pendiente de alertas antes de permitir que otro usuario use el dispositivo; nunca reutilizar una vinculacion de la cuenta anterior.
- Las alertas de riesgo fallidas deben persistir solo una senal generica e idempotente, con maximo 20 eventos y 24 horas de retencion local. Reintentar al reconectar sin guardar motivo, paquete, texto, URL ni busqueda.
- Checkpoint del 17 de julio de 2026: la excepcion por falso positivo deja de ser una ventana amplia. El PIN solo concede 20 segundos para el incidente exacto confirmado como error; esto protege al usuario en impulso y evita convertir el PIN en un bypass funcional del Refugio.

- Toda cadena visible en español debe conservar tildes, signos y `ñ` reales; no aceptar sustituciones como `Espanol`, `proteccion` o texto con codificación rota. Corregir texto solo en literales visibles, nunca mediante una conversión masiva de archivos que pueda alterar operadores de TypeScript.
- Todo cambio de apariencia debe validarse tanto en modo claro como en modo oscuro y en Android móvil. Antes de un APK, las pruebas visuales deben comprobar que el centro de control, la barra inferior y los textos visibles mantienen contraste, espacio y legibilidad.
- Cierre del 18 de julio de 2026: Ajustes y modo oscuro quedan en revisión, no aprobados. La siguiente sesión debe rediseñar el Centro de control como grupos de acciones claramente separados y resolver contraste, estados, botones y texto en oscuro antes de volver a generar APK. No usar este trabajo parcial como referencia visual aprobada.
- Al cerrar una sesión, detener procesos de build o Metro iniciados por la sesión, conservar solo las dos APK rotativas y eliminar artefactos temporales de validación que ya no se necesiten. Nunca borrar código, documentos de producto, checkpoints ni APKs vigentes por una limpieza.
- En controles críticos de Android, no depender de callbacks de estilo de `Pressable` para fondo, borde, dimensiones o distribución. Usar estilos directos y `android_ripple`, porque la interoperabilidad CSS puede omitir el callback en el APK aunque funcione en web.
- Antes de aprobar cambios de Ajustes o autenticación, comprobar modo claro y oscuro en 320, 360, 393 y 412 dp. La prueba debe verificar límites laterales, altura mínima, separación entre filas y contraste del botón de Google.
- Correccion de tema del 20 de julio de 2026: el cambio claro/oscuro debe actualizar el estado antes de persistirlo y rem montar la pantalla de Ajustes con la preferencia nueva para evitar tarjetas colapsadas durante la transicion. El control visible es un `Switch` accesible; no duplicar su accion con el `Pressable` contenedor.
- La identidad tecnica que Google muestra en el consentimiento OAuth proviene del proyecto OAuth/Supabase, no del boton React Native. Para mostrar `Clean4Jesus` se debe configurar Branding en Google Auth Platform y, si se necesita ocultar el host `*.supabase.co`, aprobar y configurar un dominio personalizado de Supabase. No prometer que un cambio de UI lo puede resolver.
- Checkpoint aprobado `1.3.12` del 20 de julio de 2026: modo oscuro, personalizacion de la pantalla de interrupcion y acceso de Comunidad con Google fueron probados y aprobados por producto. No modificar estas tres areas sin una solicitud explicita y una nueva validacion visual en Android.
- La matriz internacional ahora incluye `es`, `en`, `fr` y `pt` (portugues brasileño inicial). Los textos de interfaz, ajustes, legales y metadatos deben pasar por i18n; no declarar completa la migracion mientras falten los cuerpos de planes/devocionales y mensajes secundarios.
- Las traducciones biblicas, devocionales y legales requieren revision humana antes de beta publica. Un fallback tecnico sirve para no romper la app, pero no sustituye contenido editorial traducido.
- Checkpoint de arquitectura editorial del 21 de julio de 2026: los ocho planes y sus 224 lecturas localizadas ES/EN/FR/PT viven en Supabase, se consumen mediante una RPC paginada y segura, y conservan cache mas fallback local para uso sin conexion. No volver a publicar planes nuevos dentro de una APK como estrategia principal.
- El cliente nunca consulta directamente las tablas editoriales ni contiene credenciales de publicacion. Mantener RLS, permisos directos revocados y acceso publico solo mediante `get_published_devotional_catalog`.
- Inscripciones, dias completados y rachas permanecen locales durante esta fase. No sincronizar progreso espiritual ni datos sensibles a Supabase sin una decision explicita de producto, consentimiento y revision de privacidad.
- Una migracion Supabase ya aplicada es inmutable. Para corregir o ampliar contenido, crear una nueva migracion y aumentar `content_version`; nunca editar silenciosamente la semilla historica.
- Checkpoint editorial del 21 de julio de 2026: el devocional diario tambien vive en Supabase. La app pide solo el contenido correspondiente a la fecha local y al idioma ES/EN/FR/PT, lo valida, lo cachea por dia y conserva un unico respaldo compacto para uso sin conexion.
- Checkpoint de escalado del 21 de julio de 2026: el catalogo de planes y el detalle quedaron separados. La lista usa `get_devotional_plan_catalog`; el cuerpo de un plan se descarga con `get_devotional_plan_detail` al abrirlo y se cachea por idioma. No volver a importar las 224 lecturas desde el runtime movil ni mezclar contenido completo dentro del catalogo.
- El APK interno de aproximadamente 216 MB es un build debug con Expo Dev Client y no representa el peso de Play Store. Para evaluar tamano de usuario, medir un AAB release y sus splits; no atribuir el peso debug al contenido editorial.
- Medicion validada el 21 de julio de 2026: el AAB release optimizado ARM64 de `1.3.13` pesa `34.07 MB` (`32.49 MiB`). El artefacto es solo de medicion porque aun usa firma debug; nunca subirlo a Play Console.
- Para builds release locales en Windows, una junction no resuelve rutas largas de CMake. Usar una copia fisica temporal corta, limpiar la cache de autolinking y verificar que los `projectDir` nativos apunten a esa copia antes de compilar.
- Antes de beta publica, la VPN debe usar un transporte DNS cifrado compatible con la politica de Google Play o contar con una decision de cumplimiento documentada. No presentar UDP/53 como tunel cifrado.
- La puerta de beta externa exige firma release/Play App Signing, legal y Data Safety aprobados, disclosure previo de Accesibilidad/VPN, consentimiento versionado, PIN endurecido, protocolo de crisis operativo y QA en varios fabricantes Android.
- Los clientes no leen directamente `daily_devotionals` ni `daily_devotional_translations`; mantener RLS, permisos directos revocados y acceso anonimo/autenticado solo mediante `get_daily_devotional`.
- Publicar o corregir devocionales diarios exige una migracion nueva y `DAILY_DEVOTIONAL_CONTENT_VERSION` mayor. No volver a empaquetar nuevos devocionales diarios en una APK como estrategia editorial.
- La migracion editorial no autoriza cambios visuales en Palabra ni en Planes. Sus layouts y navegacion continuan congelados; solo cambia la fuente de datos y el comportamiento offline.
- Rescate de 60 segundos: es una accion opcional dentro de la pantalla nativa de interrupcion. Presenta una respiracion guiada de cinco ciclos 4-2-6, no desbloquea la app bloqueada, no pausa VPN/Accesibilidad, no concede PIN y al finalizar devuelve a la pantalla de bloqueo. No guardar texto, URL, paquete ni contenido detectado durante el rescate.
- El rescate debe permanecer disponible como apoyo breve y no como promesa clinica: copy calmado, accesible y centrado en recuperar margen de decision. La accion nunca sustituye a la persona de confianza ni al protocolo de crisis.
- Revision de producto del rescate (23 de julio de 2026): el CTA debe presentarse como una pausa guiada, con copy humano y una tarjeta visual propia; no debe competir con el motivo del bloqueo ni convertir el rescate en un bypass. Validar en Android real antes de declararlo checkpoint.
- Checkpoint aprobado `1.3.13` (23 de julio de 2026): pantalla nativa de interrupción simplificada a dos acciones visibles (`Respirar 60 segundos` y `Cerrar`); `¿Fue un error?` queda como texto clicable que abre el PIN; el motivo usa `¿Por qué lo bloqueamos?`. No tocar el motor de bloqueo, VPN, Accesibilidad, PIN, cierre de app ni personalización sin solicitud explícita.
- Consejo de producto y release (23 de julio de 2026): Sofía Beltrán aprueba una respiración visual sutil en el rescate, con la foto personalizada conservada como elemento principal y sin animación ornamental en la pantalla de bloqueo. Valentina Cruz exige que el cambio permanezca aislado en `InterruptionActivity.kt`; Mateo Vidal exige compile, instalación, bloqueo real, cinco ciclos, retorno sin bypass y pruebas ES/EN/FR/PT en Pixel 9. Samuel Ortega mantiene `NO-GO` para APK hasta contar con preview móvil aprobado y evidencia de dispositivo real.
- Checkpoint de datos y falsos positivos (23 de julio de 2026): se desplegó en Supabase la tabla `public.false_positive_reports` y la Edge Function `report-false-positive`. El cliente solo reporta después de PIN correcto y envía hashes, paquete, huella de regla, idioma, versión y fuente fija; nunca texto, URL, historial, mensajes, capturas, correo o PIN. RLS permanece activo y `anon`/`authenticated` no tienen permisos directos. Esta señal no cambia reglas automáticamente ni crea una lista blanca; cualquier aprendizaje futuro exige revisión humana y publicación versionada. Mantener intactos el bloqueo, VPN, Accesibilidad, PIN, aprobación local de 20 segundos y pantalla nativa aprobada `1.3.13`.
- Revisión humana de falsos positivos (23 de julio de 2026): la consola interna usa `private.false_positive_review_cases` y una auditoría inmutable. Moderadores con MFA pueden reclamar o pedir evidencia; solo administradores con MFA confirman falso positivo o mantienen bloqueo. La decisión nunca altera reglas, allowlists ni el teléfono automáticamente. Cualquier cambio futuro de política debe ser una publicación versionada, probada y aprobada por separado.
- Backup de proyecto aprobado (23 de julio de 2026): el repositorio privado `adminclean4jesus-lang/clean4jesus` queda como respaldo remoto oficial, con la rama `main` sincronizada en el commit `ed5a70d`. En cada cambio relevante, actualizar Git con un commit fechado y un mensaje breve que describa lo realizado, y hacer `push` a `origin/main`. Nunca subir `.env`, claves, credenciales, APKs, AABs, caches ni artefactos temporales; conservarlos solo localmente cuando sean necesarios.
- Cierre de sesion (23 de julio de 2026): se conserva el checkpoint de backup remoto y se prepara el siguiente gran frente del roadmap: migracion completa a iOS. No iniciar cambios de iOS hasta revisar arquitectura, capacidades equivalentes, limites de VPN/Accesibilidad, autenticacion, notificaciones, comunidad, privacidad, QA y requisitos de App Store. El objetivo es paridad funcional responsable, no copiar APIs de Android que iOS no permita.
- Inicio de migración iOS (25 de julio de 2026): Android conserva íntegros sus módulos nativos aprobados. iOS usa una frontera de plataforma separada y nunca puede declarar Refugio activo hasta que Family Controls, Managed Settings, Device Activity y, si aplica, Network Extension estén aprobados por Apple, implementados en extensiones nativas y validados en un iPhone físico. La primera ruta iOS comunica este estado con honestidad y mantiene disponibles Palabra, Comunidad, Perfil, idiomas y ajustes locales.
- Preparación iOS sin Apple Developer (25 de julio de 2026): adelantar código compartido, configuración Expo/EAS, contratos, pruebas, documentación y checklist de release sin crear cuentas, aceptar contratos, generar certificados ni guardar secretos externos en nombre del CEO. `config/ios-release-readiness.json` es la fuente de verdad de los requisitos externos; sus estados solo pasan a `true` con evidencia real de Apple, Google, Expo o un dispositivo físico. Ejecutar `npm run test:ios:readiness` antes de TestFlight o cualquier afirmación de disponibilidad iOS.
- Antes de activar App Store Connect, mantener actualizado `docs/IOS-APP-STORE-PREPARATION.md` con copy, URLs, mapa de privacidad, capturas requeridas y plan de TestFlight. Es una guia de preparacion: el titular completa y confirma los cuestionarios legales y clasificaciones dentro de Apple.
- Landing oficial (25 de julio de 2026): `clean4jesus.com` se construye mediante `npm run landing:build` y se despliega con `npm run landing:deploy` solo tras aprobacion explicita del CEO. No publicar QR, enlace de descarga, afirmacion de disponibilidad, estadistica sanitaria o promesa de proteccion perfecta sin URL real, fuente verificable y revision de Growth/Legal. Todo copy sobre pornografia debe distinguir asociacion de causalidad y evitar diagnosticos, miedo o vergüenza.
- Investigación pública (25 de julio de 2026): Daniela Pardo, Research & Evidence Lead, mantiene el protocolo `docs/RESEARCH-EVIDENCE-PROTOCOL.md`. Para cerebro, salud mental, menores, pornografía, masturbación o sexualidad, usar fuentes revisadas y citar método/límite; nunca declarar “daño cerebral” universal, adicción automática, cura, diagnóstico o causalidad individual. La evidencia médica y la convicción cristiana se presentan como planos distintos y ambos deben ser claros.
- Checkpoint de capturas seguras (25 de julio de 2026): la pantalla nativa de interrupción y el rescate permiten capturas para QA y soporte. Al abrir la entrada del PIN se activa protección de pantalla con `FLAG_SECURE`; al cancelarla se vuelve a permitir la captura. La interfaz advierte que una captura puede incluir la imagen personalizada. No modificar el motor de bloqueo, VPN, Accesibilidad, cierre de apps ni validación del PIN al mantener esta capacidad.
- Cierre de sesión (25 de julio de 2026): APK interna actual verificada, 154 pruebas unitarias aprobadas, TypeScript y compilación Android correctos. El código fuente quedó respaldado en GitHub mediante el commit `4431542`; conservar solo los APK `current` y `previous` y eliminar copias temporales de compilación.
- Regla nativa de controles (26 de julio de 2026): los controles criticos visibles en APK Android, incluido `Hoy / Planes`, deben usar estilos directos y `android_ripple`; no depender de callbacks `style={({ pressed }) => ...}` porque Fabric/CSS interop puede renderizarlos bien en web y omitirlos en el dispositivo.
- Regla de eficiencia del Refugio (26 de julio de 2026): no recorrer `rootInActiveWindow` completo ante cada `TYPE_WINDOW_CONTENT_CHANGED`. Agrupar eventos repetitivos, limitar frecuencia, profundidad, nodos y texto; conservar respuesta inmediata en apertura de ventana y escritura. Cualquier optimizacion debe mantener intactos terminos, dominios, alcance de apps, VPN, PIN, interrupcion, bancos y YouTube.
- Checkpoint aprobado del selector `Hoy / Planes` (26 de julio de 2026): el selector nativo en Android queda visual y funcionalmente aprobado por producto. `Hoy` y `Planes` deben mostrarse siempre como dos botones segmentados; el activo usa fondo azul y texto blanco, el inactivo fondo claro y texto azul. No volver a parchear ni rediseñar este control sin solicitud explícita y nueva validación en Pixel.
- Diagnóstico iOS `1.3.16 (5)` (4 de agosto de 2026): el crash físico ocurre aproximadamente 0,5 segundos después del lanzamiento con `EXC_BAD_ACCESS`. La pila principal entra por `RCTMountingManager` y la captura Fabric de `react-native-screens`; otra pila registra conversión de excepciones de TurboModules. Ejecutar el puente Screen Time en main queue fue correcto pero insuficiente y no debe presentarse como solución del arranque.
- Candidata iOS `1.3.16 (6)`: mantener la Nueva Arquitectura porque Reanimated 4 la exige, pero desactivar `react-native-screens` únicamente en iOS mediante `enableScreens(false)`. Android conserva native screens y todos sus checkpoints. En iOS no registrar listeners ni pedir permisos de notificaciones durante el arranque; esas llamadas deben ser diferidas y accionadas por el usuario. No enviar esta candidata a TestFlight hasta confirmar primero que el build termina y después obtener autorización explícita del CEO.
