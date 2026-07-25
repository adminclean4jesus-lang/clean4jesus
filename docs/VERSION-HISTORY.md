# Clean4Jesus Version History

## Candidata De Navegacion Y Landing - 2026-07-25

- Palabra recupera el selector segmentado `Hoy / Planes`, con estado activo visible y areas tactiles estables.
- La barra inferior elimina la navegacion interna duplicada de Expo Router y conserva un unico destino activo.
- QA aprobo TypeScript, el layout publico en escritorio y Pixel, y el footer movil en anchos Android de 320, 360, 393 y 412 px.
- La landing oficial se publico en `clean4jesus.com` con mockups reales en proporcion nativa, sin estirar ni recortar las capturas.
- Se genero una nueva APK local `current`; queda pendiente la aprobacion de producto en Pixel antes de declararla checkpoint.

## Fundacion iOS - 2026-07-25

- Se agrega una frontera de plataforma para que iOS no reutilice ni simule el Refugio Android.
- El arranque iOS muestra una ruta honesta de preparacion mientras Palabra, Comunidad, Perfil, idiomas y ajustes compartidos continúan disponibles.
- Se agregan perfiles EAS iOS y validaciones de compilacion/exportacion. La proteccion nativa iOS queda pendiente de Apple Developer, Family Controls y extensiones Swift; no corresponde a una version publicable todavia.

## Correo Operativo - 2026-07-23

- Cloudflare Email Routing configurado para `soporte@clean4jesus.com`, `privacidad@clean4jesus.com` y `seguridad@clean4jesus.com`.
- Las tres direcciones fueron probadas y entregan mensajes en `adminclean4jesus@gmail.com`.
- Se conserva una sola bandeja administrativa por ahora; la migración a buzones independientes queda para una etapa posterior.

## Legal UI - 2026-07-23

- El centro legal adopta la identidad visual de Clean4Jesus con logo oficial, tipografias locales Lexend/Inter y responsive móvil.
- El `4` del wordmark pasa a blanco con contorno azul para mejorar contraste y coherencia con el logo.
- El footer público queda reducido a copyright y `soporte@clean4jesus.com`, sin mostrar el nombre personal del responsable.
- Sitio legal publicado y verificado en sus rutas principales con HTTP 200.

## Legal 1.1 - 2026-07-23

- Se aclara el alcance profundo de Accesibilidad y VPN local.
- Se separan explicitamente los datos locales del Refugio, metadatos voluntarios de falsos positivos y datos de Comunidad.
- Se actualiza la version de privacidad para exigir una nueva aceptacion cuando corresponda.

## Checkpoint Legal Y De Privacidad - 2026-07-23

- Se publicaron en `legal.clean4jesus.com` Privacidad, Terminos, Reglas de Comunidad, Seguridad Infantil, Eliminacion de Cuenta y Soporte.
- La app registra el paquete legal aceptado, idioma, fuente y fecha; una persona autenticada debe reaceptar cuando cambie la version antes de entrar a Comunidad.
- Supabase ejecuta una purga diaria: falsos positivos a 12 meses y auditoria/casos cerrados a 24 meses.
- Comunidad queda restringida a mayores de 18 anos para la beta. Refugio y Palabra siguen disponibles localmente sin cuenta.
- QA aprobado: TypeScript, 146 pruebas unitarias, sitio legal compilado y siete rutas publicas con HTTP 200.
- La base queda habilitada para iniciar iOS. Publicacion abierta sigue bloqueada por revision juridica, buzones reales, licencias biblicas, formularios de tiendas y prueba QA de eliminacion.

## 1.3.13 - 2026-07-21

### Incluye

- Cobertura completa de interfaz y contenido editorial en español, inglés, francés y portugués.
- Detección del idioma del teléfono en la primera apertura y persistencia de la preferencia elegida.
- Elimina el destello inicial en español mientras se restaura el idioma guardado.
- Traduce mensajes nativos de VPN e interrupción y corrige el singular de `día` en los cuatro idiomas.

### Estado De Producto

- APK interna para validar idiomas; no cambia la lógica aprobada de Refugio, bloqueo, Google, comunidad ni modo oscuro.
- La migración futura de planes a contenido remoto queda fuera de esta versión.

## 1.3.12 - 2026-07-20

### Incluye

- Candidata visual para cerrar el cambio claro/oscuro sin romper tarjetas al cambiar de preferencia.
- Ajustes validado como lista legible y responsive, sin iconos decorativos ni filas comprimidas.
- Boton de Google validado con isotipo oficial, fondo, contraste y alineacion estable en anchos Android comunes.
- QA automatizado aprobado: TypeScript, 115 unitarias, export web y 12 recorridos E2E.

### Estado De Producto

- Lista para APK interna de prueba visual y funcional.
- Refugio, bloqueo, Palabra, footer y Comunidad conservan sus checkpoints protegidos.

Este documento registra las versiones publicadas de Clean4Jesus y los cambios que entran en cada una.

## 1.3.11 - 2026-07-20

### Incluye

- Corrige el fallo nativo que ocultaba el fondo y el texto del botón `Continuar con Google` en modo oscuro.
- Presenta Google como un botón blanco completo, con isotipo oficial, tipografía de la app y alineación estable en claro y oscuro.
- Reconstruye Ajustes como filas independientes, legibles y adaptables sin apiñar títulos o descripciones.
- Valida Ajustes y autenticación en anchos Android de 320, 360, 393 y 412 dp.
- Mejora la accesibilidad de `Ingresar` y `Crear cuenta` para anunciar correctamente la opción seleccionada.

### Estado De Producto

- OAuth, Supabase, Refugio, Palabra, footer y lógica nativa de protección permanecen sin cambios.
- QA aprobado: TypeScript, 115 pruebas unitarias, 12 recorridos E2E, exportación web y 17 controles de Expo.

## 1.3.10 - 2026-07-20

### Incluye

- Reconstruye el botón `Continuar con Google` con el isotipo oficial limpio, sin recuadro ni fondo incrustado.
- Alinea icono y texto como una unidad responsive y usa la tipografía vigente de Clean4Jesus.
- Evita que TalkBack anuncie el isotipo por separado y conserva una sola acción accesible.
- Añade una prueba geométrica para impedir que regresen el cuadro, la desalineación o el solapamiento del botón.

### Estado De Producto

- No modifica el flujo OAuth, Supabase, Refugio, Palabra, footer ni la lógica nativa de protección.
- Requiere preflight completo y validación final en Android antes de quedar como checkpoint visual.

## 1.3.8 - 2026-07-18

Candidata interna centrada en cerrar mejor la Fase 1 del core de proteccion antes de seguir con beta publica.

### Incluye

- Verificacion del PIN unificada entre React Native y Android nativo, para que las mismas reglas de intentos y pausa apliquen en Proteccion de apps, cambio de PIN y pantalla de interrupcion.
- Sincronizacion nativa del PIN mas estricta: al cambiarlo se limpian bloqueos y residuos anteriores del guardian en Android.
- Flujo de persona de confianza con estado mas honesto: ahora diferencia mejor entre vinculacion creada, telefono listo e invitacion pendiente.
- Visibilidad de expiracion del codigo de invitacion en el flujo pendiente.
- Texto de privacidad ajustado para aclarar que la metadata minima de acompanamiento y alertas genericas si se sincroniza, pero no el contenido sensible.

### Estado De Producto

- Punto 1 sigue en candidata interna: requiere validacion manual del desbloqueo temporal por PIN, expiracion del permiso y flujo de guardian en Android real.
- QA local aprobado: TypeScript y 108 pruebas unitarias en verde.
- Refugio, Palabra, Comunidad, footer, allowlists de banca/YouTube y visual aprobada no fueron redisenados en este corte.

### Cierre De Ajustes

- Se redujo el ruido de Refugio y se retiro el recordatorio y accesos que pertenecian a otros modulos.
- Ajustes se reorganizo alrededor de acciones de producto y se anadio la base para alternar tema claro/oscuro.
- Este trabajo no es checkpoint visual: el modo oscuro tiene problemas de contraste y el Centro de control necesita un redisenio de jerarquia antes de una nueva APK candidata.

## 1.3.6 - 2026-07-16

Candidata interna que completa la implementacion de la Fase 1 del core de proteccion.

### Incluye

- Desbloqueo supervisado por PIN durante 15 minutos, limitado a la app exacta y resistente a cambios de hora o reinicios del dispositivo.
- Cambio de PIN protegido por el PIN vigente y rate limit despues de cinco intentos fallidos.
- Pantalla de interrupcion personalizable con frase, referencia e imagen local; la accion principal permanece visible antes del diagnostico.
- Persona de confianza con invitacion de un solo uso, consentimiento bilateral, revocacion y configuracion de umbral por el guardian.
- Alertas privadas sin palabras, URLs, apps ni contenido, con idempotencia, reintento seguro, cooldown solo tras entrega y retencion acotada.
- La identidad nativa de alertas se elimina al cerrar sesion o borrar la cuenta para impedir avisos cruzados entre usuarios del mismo telefono.
- Android conserva hasta 20 senales genericas durante 24 horas y las reintenta al recuperar conectividad, sin guardar el motivo, la app ni el texto detectado.

### Estado De Producto

- Migraciones `20260716224022` y `20260716235500` aplicadas; funciones `accountability` y `accountability-signal` activas en Supabase.
- QA local aprobado: 100 pruebas unitarias, 10 E2E, TypeScript, export web, compilacion Android y lint remoto de base de datos.
- APK de desarrollo `versionCode 41` generado y rotado como `artifacts/apk/current/Clean4Jesus-current.apk` para validacion en dispositivo.
- Refugio, VPN, allowlists, YouTube, banca, Palabra, Planes, Comunidad y footer no fueron redisenados ni ampliados.
- Falta la puerta manual GO/NO-GO en Pixel 9 y un segundo Android antes de declarar esta fase checkpoint de produccion.

## 1.3.5 - 2026-07-16

Prueba interna de proteccion antiabuso y operacion profesional de Comunidad.

### Incluye

- Cloudflare Turnstile integrado en ingreso, registro y recuperacion mediante una pagina HTTPS aislada y WebView nativa.
- SMTP propio previamente validado para confirmacion, recuperacion y aviso de cambio de contrasena.
- Consola interna de moderacion publicada con roles privados, MFA TOTP obligatorio, evidencia durable e idempotencia.
- Primera cuenta administradora habilitada sin exponer credenciales administrativas en la app ni en el panel web.

### Estado De Producto

- CAPTCHA permanece desactivado en Supabase hasta validar este APK en Android; asi los clientes anteriores no quedan bloqueados.
- Refugio, Palabra, Planes y footer conservan exactamente el checkpoint visual y funcional `1.3.4`.
- La beta externa requiere completar la prueba Android y activar Turnstile en Bot and Abuse Protection.

## 1.3.4 - 2026-07-15

Primera candidata instalable con registro y Comunidad real para pruebas internas.

### Incluye

- Registro, confirmacion por correo, inicio de sesion, recuperacion, perfil, cierre y eliminacion de cuenta sobre Supabase.
- Comunidad real con publicaciones, comentarios, apoyo en oracion y reportes confidenciales para cinco categorias.
- Eliminacion de publicaciones y comentarios propios, estados de error recuperables y guia de confirmacion en el mismo dispositivo.
- Privacidad reforzada: los miembros solo reciben una identidad publica de feed; no pueden enumerar perfiles, UUID de autores ni identidades de quienes oraron.
- Activacion VPN confirmada por Android, dos DNS familiares con estado fail-safe, allowlist por paquete y copy honesto del analisis local de texto visible.
- Medicion de limites de apps acotada a eventos observados para no seguir sumando tiempo despues de abandonar una red social.

### Estado De Producto

- Diez migraciones sincronizadas; lint remoto y dos suites adversariales remotas aprobadas.
- APK debug `1.3.4` (`versionCode 39`) validada y aprobada por producto en Android para pruebas internas.
- QA final: 70 pruebas unitarias, 7 E2E, TypeScript, export web, Expo Doctor 17/17 y dos red teams con resultado GO.
- Refugio, Palabra, Planes y footer permanecen en su checkpoint visual aprobado.
- El correo gratuito de Supabase conserva limites estrictos; SMTP propio y CAPTCHA siguen requeridos antes de una beta publica.

## 1.3.3 - 2026-07-14

Endurecimiento de identidad y contratos negativos de Comunidad.

### Incluye

- Recuperacion de contrasena autorizada solo por un evento `PASSWORD_RECOVERY` real, con permiso local ligado al usuario, vencimiento y un solo uso.
- Sesiones resistentes a desconexion y carreras: una falla transitoria conserva la sesion util; una identidad invalidada se limpia de forma determinista.
- Eliminacion de cuenta con reautenticacion obligatoria dentro de la Edge Function, no solo en la UI.
- RLS reforzado para identidades borradas, contenido oculto, hijos de publicaciones ocultas y minimo privilegio por columnas.
- Moderacion con evidencia durable, idempotencia ligada al payload, control de version y cuota serializada bajo concurrencia.

### Estado De Producto

- Ocho migraciones sincronizadas y Edge Functions `delete-account` y `moderate-community` desplegadas.
- 58 pruebas unitarias, 7 E2E, export web, lint remoto y dos suites adversariales remotas aprobadas.
- Las pruebas remotas incluyen contrasena incorrecta, JWT revocado o antiguo, concurrencia, evidencia y codigos de error exactos.
- Refugio, Palabra, Planes y footer permanecen intactos en el checkpoint aprobado `1.2.24`.
- SMTP propio, CAPTCHA, consola operativa y aprobacion legal siguen bloqueando la beta publica.

## 1.3.2 - 2026-07-14

Moderacion comunitaria profesional y auditable sobre Supabase.

### Incluye

- Roles privados de moderador y administrador; ningun rol administrativo vive dentro del APK.
- Casos agrupados con evidencia durable, snapshots del contenido y auditoria inmutable.
- Acciones atomicas con identidad derivada de `auth.uid()`, control de version e idempotencia.
- Restauracion de contenido reservada a administradores con MFA y Edge Function de moderacion con JWT.
- Runbook operativo, guias comunitarias, protocolo de crisis y borradores legales preparados para revision.

### Estado De Producto

- Cuatro migraciones sincronizadas y dos Edge Functions activas en el proyecto real.
- Prueba adversarial remota aprobada de extremo a extremo; Performance Advisor limpio.
- SMTP propio, CAPTCHA, consola interna de moderacion y aprobacion legal siguen pendientes antes de beta.
- No hubo cambios visuales ni funcionales en Refugio, Palabra, footer o Planes.

## 1.3.1 - 2026-07-14

Endurecimiento profesional de identidad y seguridad sobre la base comunitaria 1.3.

### Incluye

- Sesion movil cifrada con SecureStore, PKCE y deep links para confirmar correo y recuperar contrasena.
- Validacion de sesion contra Supabase, reenvio de confirmacion y borrado de cuenta con reautenticacion.
- Minimo privilegio por columna: el cliente no puede falsificar rachas ni estados de moderacion.
- Cuotas anti-spam en Postgres para publicaciones, comentarios y reportes.
- Edge Function para eliminacion completa y prueba adversarial RLS con dos usuarios temporales.

### Estado De Producto

- Proyecto Supabase real enlazado, migraciones aplicadas y Edge Function de eliminacion activa.
- Prueba remota con dos usuarios aprobada: aislamiento, campos sensibles, moderacion y eliminacion completa.
- TypeScript, 36 pruebas unitarias, 7 E2E y export web aprobados con el backend configurado.
- Moderacion administrativa, SMTP propio, CAPTCHA y politicas legales siguen siendo bloqueos antes de beta publica.
- Footer, Planes y Refugio permanecen congelados en el checkpoint `1.2.24`.

## 1.3.0 - 2026-07-14

Inicio de la arquitectura real de cuentas y Comunidad sobre Supabase.

### Incluye

- Supabase Auth con registro, inicio, persistencia y cierre de sesion.
- Perfiles editables con nombre visible, ciudad y biografia; el correo nunca se publica en el feed.
- Feed real de pedidos de oracion, testimonios y avances, con apoyo en oracion, respuestas y reportes.
- Migracion Postgres versionada con RLS para perfiles, publicaciones, oraciones, comentarios y reportes.
- Pruebas automaticas que protegen RLS y evitan claves administrativas dentro del cliente movil.

### Estado De Producto

- Implementacion local completa y compilando; pendiente enlazar el proyecto Supabase y ejecutar la migracion para pruebas reales multiusuario.
- Sin APK generado en este hito y sin credenciales privadas incluidas en el repositorio.
- Footer, Planes y Refugio conservan el checkpoint aprobado de `1.2.24` sin cambios funcionales ni visuales.

## 1.2.24 - 2026-07-14

Checkpoint Android aprobado para la distribucion del footer sin tocar Planes.

### Incluye

- Sustituye los anchos dinamicos del `Pressable`, que Android reducia al ancho del contenido, por cuatro cuadrantes absolutos contiguos.
- Cada destino queda anclado fisicamente a `0-25%`, `25-50%`, `50-75%` y `75-100%` del contenedor.
- Nueva prueba de contrato que impide restaurar `useWindowDimensions`, `tabWidths` o callbacks de estilo dimensionales en el footer.

### Estado De Producto

- Planes conserva exactamente el layout aprobado en `1.2.23`.
- Sin cambios en Refugio, VPN, Accesibilidad, bloqueo, YouTube ni banca.
- APK local ARM64 generado y verificado: `versionCode 34`, paquete `com.clean4jesus.app`.
- Aprobado visualmente en Android real: footer y Planes quedan como checkpoint protegido.

## 1.2.23 - 2026-07-14

Correccion responsive estructural para Android en el footer y el catalogo de Planes.

### Incluye

- El footer calcula las cuatro zonas tactiles desde el ancho real de la ventana, sin depender de distribucion flex ambigua en Android.
- Los planes usan flujo vertical normal: ilustracion completa, contenido y accion ocupan espacios propios sin posiciones absolutas ni anchos porcentuales fragiles.
- Contratos de regresion y pruebas E2E para anchos de `320`, `360`, `393` y `412` dp.

### Estado De Producto

- Sin cambios en Refugio, VPN, Accesibilidad, bloqueo, YouTube ni banca.
- APK local ARM64 generado y verificado: `versionCode 33`, paquete `com.clean4jesus.app`.

## 1.2.22 - 2026-07-14

Identidad visual de Planes para distinguir cada recorrido desde el catalogo.

### Incluye

- Tonos, bordes y guias laterales propios para cada plan, alineados con su tema y arte.
- Franja de accion separada para hacer visible el siguiente paso sin mezclarlo con la descripcion.
- Mantiene el footer estructural y la proteccion de no solapamiento de titulo e ilustracion.

### Estado De Producto

- Sin cambios en Refugio, VPN, Accesibilidad, bloqueo, YouTube ni banca.
- APK local ARM64 generado y verificado: `versionCode 32`, paquete `com.clean4jesus.app`.

## 1.2.21 - 2026-07-14

Correccion final del catalogo de Planes despues de la validacion Android de `1.2.20`.

### Incluye

- Se elimina la fila flexible que en Android reorganizaba arte y texto como una columna accidental.
- Cada plan usa una tarjeta editorial estable: arte anclado, carril de texto reservado, estado y accion visibles.
- Nueva prueba E2E que falla si el titulo invade el arte de un plan.

### Estado De Producto

- No toca Refugio, VPN, Accesibilidad, bloqueo, YouTube, banca ni el footer ya corregido.
- APK local ARM64 generado y verificado: `versionCode 31`, paquete `com.clean4jesus.app`.

## 1.2.20 - 2026-07-14

Correccion estructural de navegacion inferior y rediseño del catalogo de Planes, sin tocar Refugio, VPN, Accesibilidad, bloqueo, YouTube ni banca.

### Incluye

- Barra inferior fija con cuatro columnas de ancho explicito: cada icono y etiqueta queda contenido dentro de su propia zona tactil.
- Prueba E2E de limites fisicos para impedir que las etiquetas del footer vuelvan a quedar pegadas o se salgan de su columna.
- Catalogo de Planes rehecho como una lista editorial: una promesa breve, duracion, accion y arte por cada plan, sin duplicar descripcion, metricas y tarjetas.

### Estado De Producto

- El cambio visual fue revisado primero con capturas moviles y pasa TypeScript, 19 pruebas unitarias, 6 recorridos E2E y export web antes del APK.
- APK local ARM64 generado y verificado: `versionCode 30`, paquete `com.clean4jesus.app`.

## 1.2.19 - 2026-07-14

Correccion visual validada antes de APK, sin cambios en Refugio, VPN, Accesibilidad, bloqueo, YouTube ni banca.

### Incluye

- Se elimina toda animacion ejecutable introducida durante la iteracion de motion; las cargas restantes son estados estaticos y no alteran el layout.
- Barra inferior fija de cuatro columnas con altura compartida y espacio inferior calculado por pantalla.
- Catalogo de Planes y acciones de Comunidad simplificados para evitar contenido truncado o tarjetas comprimidas en movil.

### Estado De Producto

- Validado con TypeScript, 19 pruebas unitarias, 6 recorridos E2E moviles, export web y revisiones adversariales de UX y Android nativo antes de empaquetar.

## 1.2.18 - 2026-07-14

Restauracion visual aprobada de la experiencia de Palabra y la navegacion persistente, sin cambios en Refugio, VPN, Accesibilidad, bloqueo, YouTube ni banca.

### Incluye

- Barra inferior estable a borde completo, con cuatro destinos distribuidos de forma uniforme y sin la capsula flotante que deformaba el layout.
- Espaciado vertical recuperado en Palabra para separar reflexion, aplicacion, CTA y planes; el extracto de la reflexion se limita a cuatro lineas en la home.
- CTA `Ver planes` protegido contra truncamiento y nueva prueba E2E movil que valida footer, labels y posicion inferior.

### Estado De Producto

- Aprobada visualmente por producto y empaquetada como APK local ARM64 (`versionCode 28`).
- Mantiene intactos los checkpoints funcionales del Refugio 1.2.7 y de notificaciones 1.2.12.

## 1.2.17 - 2026-07-13

Rollback visual al checkpoint anterior al motion. Esta version elimina la capa de animaciones que habia desordenado el layout y devuelve la app al look estable que ya estaba aprobado.

### Incluye

- Remocion del loader animado y regreso a una carga sobria, centrada y estable.
- Eliminacion de entradas `Animated` que estaban alterando `Refugio`, `Palabra`, `Comunidad`, `Ajustes` y planes.
- Footer persistente recuperado con espaciado y distribucion estables, sin labels pegados ni tabs desalineados.
- Mantiene intacto el producto funcional: bloqueo, palabra, comunidad, notificaciones y checkpoints previos.

### Aprendizajes Clave

- Una capa de motion no puede entrar si antes no pasa revision visual completa en Android real.
- En Clean4Jesus, estabilidad visual pesa mas que una animacion bonita.
- Cuando una mejora rompe jerarquia o layout, se hace rollback rapido al ultimo checkpoint sano en vez de seguir parchando encima.

### Estado De Producto

- Esta version no quedo aprobada por QA de producto en Android real.
- Persistieron regresiones visuales serias: footer flotante y mal distribuido, labels pegados, cards cortadas y truncamiento visible en `Ver planes`.
- La siguiente sesion debe tratar `1.2.17` como version fallida de rollback, no como base sana.

## 1.2.14 - 2026-07-13

Iteracion enfocada en motion premium y transiciones mas vivas, sin tocar el checkpoint funcional del Refugio.

### Incluye

- Nuevo `AppLoadingExperience` reutilizable para cargas de Refugio, Palabra, Comunidad, Ajustes y pantallas de planes.
- Banner animado de completado para el Refugio cuando las capas quedan alineadas al 100%.
- Entradas suaves y escalonadas en Refugio, Palabra, Comunidad, Ajustes y detalle de planes para que la app se sienta menos plana.
- Cambio de modo `Hoy` / `Planes` en Palabra con transicion mas calmada y natural.
- Version tecnica y visible actualizada a `1.2.14`.

### Aprendizajes Clave

- La animacion buena no debe vivir en el render; debe arrancar y limpiarse desde efectos para no dejar comportamientos inestables.
- En Clean4Jesus conviene motion calmado, de respiracion y entrada progresiva, no animacion agresiva o demasiado “show off”.
- Antes de sacar APKs visuales, conviene validar la sensacion general con preview y luego con QA tecnico para no usar el build como descubrimiento.

## 1.2.13 - 2026-07-13

Iteracion enfocada en fortalecer `Palabra`, hacer mas inteligente el recordatorio de planes y darle mas vida al feed de Comunidad.

### Incluye

- Recordatorios de planes mas contextuales: ahora apuntan al dia sugerido, detectan dias pendientes y ajustan el copy para retomar sin perder el hilo.
- Home de `Palabra` mas clara y editorial: planes destacados con mejor narrativa, estado real del plan y siguiente lectura visible.
- Vista de detalle de plan mejorada con descripcion, estado de avance y dias pendientes antes de entrar a cada lectura.
- Feed de `Comunidad` rehecho con metricas, filtros, acciones rapidas y perfiles falsos mas creibles para probar interaccion.
- Version tecnica y visible actualizada a `1.2.13`.

### Aprendizajes Clave

- Los planes enganchan mas cuando el usuario entiende que debe leer hoy, no cuando se le muestra todo el contenido de golpe.
- Las notificaciones de `Palabra` funcionan mejor si empujan al siguiente paso real del plan y no a una ruta generica.
- Comunidad gana muchisimo cuando tiene senales de actividad, contexto y perfiles mas humanos, aunque todavia sea seed data local.

### Pendiente Para 1.2.14

- Pulir visualmente `Palabra` con mas profundidad visual, assets y ritmo entre home, plan y lectura.
- Convertir la notificacion de prueba en recordatorios configurables reales por plan.
- Seguir llevando `Comunidad` hacia una base lista para backend sin perder la calma visual conseguida.

## 1.2.12 - 2026-07-09

Pulido de notificaciones de Palabra con icono nativo Android, permiso de sistema y preview realista de recordatorio de plan.

### Incluye

- Android ahora usa un small icon dedicado para notificaciones (`notification-icon.png`) en la barra de estado y la bandeja, en vez del circulo generico.
- Se reforzo la configuracion nativa del icono y color de notificaciones tanto en `app.json` como en `AndroidManifest.xml`.
- El servicio de recordatorios de Palabra fue reconstruido: crea el channel, consulta permiso, agenda recordatorio diario y sincroniza cambios de hora o progreso.
- La prueba local ahora manda un ejemplo de recordatorio de plan, no una alerta generica.
- Se evita que una notificacion vieja vuelva a redirigir al usuario al arrancar: al consumir la ruta se limpia la ultima respuesta nativa.
- Se evita apilar multiples notificaciones de prueba durante QA: una nueva prueba cancela la anterior antes de programarse.
- Version tecnica y visible actualizada a `1.2.12`.

### Aprendizajes Clave

- En Android, el icono pequeno de notificacion no sale automaticamente del launcher icon; necesita asset monocromo dedicado y metadata nativa explicita.
- Si se usa `getLastNotificationResponseAsync()`, hay que limpiar la ultima respuesta despues de navegar o un arranque futuro puede reabrir una ruta vieja.
- La notificacion de prueba debe parecerse al recordatorio real que el usuario recibira; si no, la QA visual se vuelve enganosa.

## 1.2.11 - 2026-07-09

Base de notificaciones para Palabra con permiso Android y prueba local desde Ajustes.

### Incluye

- Android ahora declara `POST_NOTIFICATIONS` en el manifiesto nativo para que la prueba funcione tambien en APK local.
- Al entrar a la app en Android, Clean4Jesus prepara primero el channel de notificaciones y luego solicita el permiso del sistema si todavia no fue respondido.
- Ajustes ahora tiene una seccion de Notificaciones con estado de permiso, explicacion clara y boton `Probar notificacion`.
- La prueba envia una notificacion local al mismo celular para validar permiso, estilo y entrega antes de automatizar recordatorios diarios.
- La pantalla de Ajustes refresca el estado de notificaciones al volver del sistema para no mostrar estados viejos.
- Version tecnica y visible actualizada a `1.2.11`.

### Aprendizajes Clave

- En Android, pedir permiso antes de crear el notification channel puede dejar una prueba inestable o confusa.
- Una prueba local no es lo mismo que push real; el producto debe decirlo con honestidad para no generar falsos positivos.
- Si una pantalla abre Ajustes del sistema, al volver debe recalcular permisos antes de mostrar `Permitido` o `Bloqueado`.

## 1.2.9 - 2026-07-08

Ajuste de calidad para Proteccion de apps antes del APK de prueba.

### Incluye

- La pantalla de Proteccion de apps ahora exige crear el PIN del guardian antes de permitir reglas por app.
- Se rehizo la visual del tiempo limitado para que usados, restantes y progreso del dia se entiendan de un vistazo.
- Se corrigio el lenguaje de acciones bloqueadas: pasar a limite con PIN ya no se presenta como si fuera un desbloqueo temporal.
- El estado visible de preparacion nativa se vuelve a calcular con sincronizacion Android real al guardar o quitar reglas.
- Version tecnica y visible actualizada a `1.2.9`.

### Aprendizajes Clave

- No basta con que una funcion "sirva"; si el copy promete otro resultado, para producto eso cuenta como bug.
- En reglas supervisadas, el PIN debe existir antes del primer bloqueo para no dejar al usuario sin salida clara.
- Antes de cada APK hay que validar no solo TypeScript y tests, sino tambien el recorrido funcional y el lenguaje exacto de las acciones sensibles.

## 1.2.8 - 2026-07-07

Primer MVP de Proteccion de apps.

### Incluye

- Nueva pantalla en Ajustes para bloquear o limitar redes sociales y navegadores vulnerables.
- Apps iniciales: TikTok, Instagram, X/Twitter, Reddit, Telegram, Facebook, Chrome, Brave, Firefox y Edge.
- Limites diarios configurables hasta 120 minutos.
- Sincronizacion local con el servicio nativo de Accesibilidad usando reglas guardadas en el dispositivo.
- Se mantiene el checkpoint del Refugio 1.2.7: bancos, YouTube y apps sensibles quedan fuera del alcance.
- Version tecnica y visible actualizada a `1.2.8`.

### Aprendizajes Clave

- Listar todas las apps instaladas requeriria permisos sensibles y puede complicar Play Store; por ahora conviene una lista curada de apps vulnerables.
- Si una app de la lista no esta instalada, la regla queda guardada pero no bloquea nada hasta que esa app exista y se abra.
- El limite diario actual es una aproximacion local basada en Accesibilidad; para mayor precision futura se evaluara Usage Stats.

## 1.2.5 - 2026-06-30

Parche pequeno para proteger el checkpoint de YouTube y reducir falsos positivos de apps sensibles.

### Incluye

- Se mantiene el icono correcto de `1.2.4` / versionCode `14`.
- Se reduce la huella del Accessibility Service cambiando `canRetrieveWindowContent` a `false`.
- El bloqueo queda apoyado en señales de eventos y la capa VPN/DNS, evitando declarar lectura completa de pantalla.
- Version tecnica y visible actualizada a `1.2.5`.

### Aprendizajes Clave

- Quitar YouTube de `packageNames` no siempre basta: algunas apps reaccionan a la capacidad global de leer ventanas.
- Para no romper comentarios de YouTube ni banca, la capa de accesibilidad debe pedir la menor capacidad posible.

## 1.2.6 - 2026-06-30

Parche de DNS para recuperar comentarios de YouTube sin tocar el checkpoint de bloqueo.

### Incluye

- Se mantiene el icono correcto de `1.2.4` / versionCode `14`.
- Se revierte la huella de Accesibilidad al comportamiento del checkpoint probado.
- Se cambia la VPN/DNS local a Cloudflare Family (`1.1.1.3` / `1.0.0.3`).
- Se cambia el host de DNS privado sugerido a `family.cloudflare-dns.com`.
- Version tecnica y visible actualizada a `1.2.6`.

### Aprendizajes Clave

- YouTube sin comentarios puede venir del filtro DNS, no del Accessibility Service.
- CleanBrowsing Family puede forzar YouTube Restricted Mode; no usarlo como default si el checkpoint exige comentarios visibles.

## 1.2.7 - 2026-06-30

Parche de UX para simplificar el refugio y mover DNS privado a avanzado.

### Incluye

- El flujo principal queda en 3 capas: PIN, VPN local y Accesibilidad.
- DNS privado manual deja de contar como requisito del porcentaje de cobertura.
- DNS privado queda en Ajustes avanzados con advertencia sobre datos moviles y YouTube.
- El desplegable de capas del Refugio ahora usa botones centrados, no filas pegadas a una esquina.
- Version tecnica y visible actualizada a `1.2.7`.

### Aprendizajes Clave

- La proteccion principal debe ser la VPN local; pedir DNS privado manual genera friccion y puede romper redes.
- La UI de capas debe sentirse como acciones claras, no como una lista tecnica.

## 1.2.3 - 2026-06-28

Parche pequeno de interrupcion visible despues de cerrar/sacar la app bloqueada.

### Incluye

- Se ajusto el orden temporal del bloqueo: primero se ejecuta la salida best-effort de la app bloqueada y despues se lanza la pantalla de interrupcion.
- La pantalla de bloqueo debe quedar al frente en vez de quedar escondida por el `HOME` automatico.
- Version tecnica y visible actualizada a `1.2.3`.

### Aprendizajes Clave

- En Accessibility Service, programar `HOME` despues de `startActivity` puede esconder la pantalla de Clean4Jesus y dejar al usuario en launcher.
- La salida best-effort debe terminar antes de abrir `InterruptionActivity`; no mezclar ambos pasos en paralelo.

## 1.2.2 - 2026-06-28

Parche de claridad del escudo y modo banca accionable.

### Incluye

- Checklist visual de 4 pasos en el refugio: PIN, VPN local, DNS y Accesibilidad.
- La pantalla principal ahora muestra VPN local y Accesibilidad dentro del porcentaje de cobertura.
- Modo banca ahora intenta pausar realmente la capa de Accesibilidad con `disableSelf()`.
- La VPN local queda como proteccion base mientras la intervencion visual esta pausada.
- Version tecnica y visible actualizada a `1.2.2`.

### Aprendizajes Clave

- Nubank bloquea por Accesibilidad activa, no por falta de VPN. Para entrar al banco, la capa de intervencion visual debe pausarse.
- La UI debe mostrar claramente que el escudo tiene varias capas y cuales faltan.

## 1.2.1 - 2026-06-28

Parche de activacion de VPN local en el onboarding del refugio.

### Incluye

- El flujo inicial ahora llama la VPN local al confirmar "Ya lo active", para que Android muestre el permiso VPN.
- Se agrega un boton visible "VPN local" en la tarjeta de preparacion del refugio.
- Se reorganizan los pasos del refugio para explicar VPN local como proteccion base y Accesibilidad como interrupcion visual.
- Version tecnica y visible actualizada a `1.2.1`.

### Aprendizajes Clave

- Implementar el servicio VPN no basta: el onboarding debe invocar el permiso VPN en el primer uso.
- Nubank puede seguir bloqueando mientras Accesibilidad este activa; VPN local resuelve la capa base, no oculta el servicio de accesibilidad.

## 1.2.0 - 2026-06-28

Primera base de arquitectura en dos capas: VPN/DNS como proteccion principal y Accesibilidad como intervencion visual.

### Incluye

- Nuevo `VpnService` nativo Android para una capa DNS local hacia CleanBrowsing Family.
- Modulo nativo `Clean4JesusVpn` para iniciar, detener y consultar la VPN/DNS desde React Native.
- Accion en Ajustes para activar o pausar la VPN local sin tocar el bloqueo por accesibilidad existente.
- YouTube queda preservado como checkpoint funcional y fuera de estos cambios.
- Version tecnica y visible actualizada a `1.2.0`.

### Aprendizajes Clave

- La proteccion principal no debe depender por completo de Accesibilidad, porque bancos como Nubank pueden bloquear cualquier servicio activo.
- La capa VPN/DNS debe sostener el bloqueo base aunque la capa de intervencion visual se pause por banca.
- La Accesibilidad sigue siendo util para interrupciones en navegadores/redes, pero no debe ser el unico pilar del escudo.

### Pendiente Para 1.2.x

- Probar en Pixel 9 que la VPN local resuelve DNS correctamente sin romper internet.
- Validar que al pausar Accesibilidad por banca, DNS/VPN sigue bloqueando contenido adulto en navegadores.
- Pulir onboarding para explicar las dos capas: proteccion base y pantalla de interrupcion.

## 1.1.3 - 2026-06-28

Parche de arquitectura para banca y checkpoint de YouTube.

### Incluye

- YouTube queda marcado como checkpoint funcional: comentarios visibles y fuera del alcance del bloqueador.
- Nuevo estado local de **Modo banca** para guiar una pausa temporal de Accesibilidad antes de usar apps bancarias.
- Tarjeta de Modo banca en Ajustes con pasos claros: pausar Clean4Jesus, usar el banco y reactivar proteccion.
- Version tecnica y visible actualizada a `1.1.3`.

### Aprendizajes Clave

- Si una app bancaria bloquea cualquier servicio de accesibilidad activo, la solucion no es mas allowlist; es un flujo de pausa/reactivacion.
- El modo banca debe aplicar a todos los bancos, no solo a Nubank.
- YouTube ya funciona y no debe tocarse en cambios que no tengan relacion directa.

### Pendiente Para 1.2.0

- Evaluar si se puede detectar estado real de accesibilidad para confirmar automaticamente cuando el usuario pausa/reactiva.
- Pulir el texto del modo banca despues de probarlo en Pixel 9.
- Mantener el bloqueo estricto en navegadores y redes sociales.
- Reemplazar el modo banca de baja friccion insuficiente por un flujo con atajo del sistema: accesibilidad shortcut y/o Quick Settings tile para pausar sin abrir Clean4Jesus.

## 1.1.2 - 2026-06-28

Parche de permisos nativos para reducir falsos positivos en apps sensibles.

### Incluye

- El servicio de accesibilidad ahora declara `android:packageNames` para limitarse a navegadores y redes sociales.
- Se elimino `flagRetrieveInteractiveWindows` para reducir la huella de lectura del servicio.
- Se quitaron permisos Android no usados en esta version: overlay y lectura/escritura de almacenamiento externo.
- Version tecnica y visible actualizada a `1.1.2`.

### Aprendizajes Clave

- No basta con ignorar Nubank o YouTube dentro del codigo Kotlin; Android y otras apps tambien ven la declaracion del servicio.
- Para apps bancarias, la primera defensa es reducir permisos y alcance nativo, no solo hacer allowlist en tiempo de ejecucion.
- La pantalla de interrupcion actual funciona como Activity, asi que no necesita permiso de overlay.

### Pendiente Para 1.2.0

- Validar en Pixel 9 si Nubank deja de mostrar el aviso tras reinstalar y reactivar accesibilidad.
- Validar si YouTube vuelve a mostrar comentarios al quedar fuera del alcance declarado del servicio.
- Si una app bancaria sigue bloqueando por cualquier servicio de accesibilidad activo, evaluar modo alternativo sin accesibilidad para usuarios que necesiten banca.

# Version 1.2.16 - Footer Estable Con Motion

- Corrige definitivamente la regresion visual del footer persistente despues de introducir motion en la app.
- Reemplaza el espacio inferior fijo por padding dinamico segun la ruta y la presencia real del footer.
- Mantiene las animaciones de carga y entrada, pero cambia las cargas internas a un modo contextual para que no compitan con la navegacion inferior.
- Deja `Refugio`, `Palabra` y `Comunidad` listos para APK final de sesion con previews revisadas antes del build.

# Version 1.2.15 - Parche Del Footer Y Layout Base

- Corrige la regresion visual introducida en `1.2.14` donde el footer persistente se aplastaba y mezclaba labels en Android real.
- Rehace la base del footer con `safe area` controlada manualmente, altura estable, mejor padding inferior y distribucion mas simetrica por tab.
- Mantiene intacto el checkpoint del Refugio y deja las animaciones de `1.2.14` vivas, pero ya sin romper la navegacion inferior.

## 1.1.1 - 2026-06-28

Parche de bloqueo mas preciso, centrado en navegadores y redes sociales.

### Incluye

- Bloqueo limitado a navegadores y redes sociales, con criterio mas estricto en browser.
- Exclusiones reforzadas para YouTube y apps financieras como Nubank.
- Version tecnica y visible actualizada a `1.1.1`.
- Checkpoint escrito para que el escudo no vuelva a tocar apps sensibles fuera de alcance.

### Aprendizajes Clave

- El bloqueo debe vivir por categoria: browsers y social first, banca y medios confiables fuera.
- Los falsos positivos se corrigen ampliando allowlist y reduciendo la superficie de inspeccion.
- Cada ajuste de bloqueo necesita quedar documentado como checkpoint versionado.

### Pendiente Para 1.2.0

- Seguir afinando el bloqueo de browsers sin tocar apps financieras.
- Revisar casos de YouTube en web si vuelven a aparecer falsos positivos.
- Mantener estable la experiencia de interrupcion.

## 1.1.0 - 2026-06-28

Segunda version estable, enfocada en endurecer el bloqueo y dejar el producto mejor versionado.

### Incluye

- Allowlist nativa por prefijos reales para YouTube y Nubank.
- Bloqueo por criterios mas estable para contenido adulto.
- Mejor salida best-effort de apps bloqueadas antes de mostrar la interrupcion.
- APK local generado con exito usando ruta corta en Windows.
- Version visible en la interfaz para no perder el hilo entre builds.

### Aprendizajes Clave

- Los falsos positivos sensibles se corrigen por categoria y prefijo, no por coincidencia suelta.
- La version tecnica y la version visible deben avanzar juntas.
- En Windows, la ruta corta sigue siendo clave para builds locales estables.

### Pendiente Para 1.2.0

- Seguir afinando el cierre best-effort.
- Reducir los falsos positivos residuales.
- Seguir avanzando en coaches, comunidad y rachas.

## 1.0.0 - 2026-06-28

Primera version estable que consolida el MVP actual.

### Incluye

- Escudo Android con DNS privado guiado y servicio de accesibilidad nativo.
- Pantalla de interrupcion full-screen con motivo claro del bloqueo.
- Allowlist por categoria para evitar falsos positivos en YouTube y apps financieras como Nubank.
- Heuristicas de bloqueo mas criteriosas para contenido adulto en navegadores, Telegram, TikTok y apps similares.
- Flujo visual estable con logo de Clean4Jesus, look and feel calmado y tipografia coherente.
- Devocional, habitos y comunidad en su base actual.
- Directivas vivas y roadmap operativo para no perder aprendizajes entre sesiones.

### Aprendizajes Clave

- El bloqueo en Android normal debe entenderse como best-effort: sacar la app del frente y mostrar la interrupcion.
- No se deben tocar las piezas que ya funcionan si el cambio no las pide explicitamente.
- Las exclusiones sensibles se manejan mejor por categoria y criterio, no por parches aislados.
- Cada sesion debe dejar un checkpoint versionado para mantener estabilidad.

### Pendiente Para 1.1.0

- Mejorar la experiencia de cierre best-effort para apps bloqueadas.
- Afinar la deteccion de senales adultas de larga cola.
- Avanzar en rachas, coaches por habito y comunidad con backend real.
# Version 1.2.4 - Refugio Mas Limpio

- Corrige el retorno despues de crear PIN: si el usuario viene de preparar el refugio, vuelve directo al flujo de configuracion.
- Compacta la pantalla principal del Refugio: la cobertura queda visible y las capas tecnicas se abren con un desplegable.
- Mueve las acciones de PIN, VPN local, DNS y Accesibilidad al panel de capas para quitar ruido visual de la pantalla.
- Actualiza el icono de la app con el nuevo escudo azul, sin fondo blanco externo, manteniendo intacta la logica del refugio.
- Corrige el adaptive icon con criterio multi-dispositivo: fondo azul full-bleed, foreground transparente y simbolo centrado en zona segura conservadora para circulo, squircle y otras mascaras de launcher.
# Version 1.3.9 - Callback Google Compatible Con Android

- Corrige `Unmatched Route` al volver de Google OAuth.
- Mantiene el redirect valido `clean4jesus://auth/callback` y agrega la ruta compatible `/callback` que Android resuelve desde el host del deep link.
- Autoriza el patron movil recomendado `clean4jesus://**` en la configuracion versionada de Supabase.
- No modifica Refugio, Palabra, Comunidad, footer ni el sistema visual.

# Version 1.3.12 - Checkpoint De Producto

- Modo oscuro aprobado en Android.
- Personalizacion de la pantalla de interrupcion aprobada.
- Acceso de Comunidad con Google aprobado.
- Estas tres areas quedan congeladas para las siguientes iteraciones.

# Sesion 2026-07-21 - AAB De Medicion Y Roadmap De Lanzamiento

- Se genero un AAB ARM64 optimizado de medicion de 34.07 MB; no es publicable porque conserva firma debug.
- Se cerro la migracion escalable de planes y devocional diario con descarga bajo demanda, cache y respaldo offline minimo.
- Se aprobaron como siguientes experiencias Rescate de 60 segundos, reporte privado de falsos positivos y resumen semanal de acompanamiento.
- Se incorporo iOS como objetivo obligatorio de lanzamiento con paridad funcional, sujeto a las capacidades y politicas nativas permitidas por Apple.
- Se definio la ruta final: producto, widgets, seguridad, legal, QA, beta cerrada y publicacion gradual en Google Play y App Store.
