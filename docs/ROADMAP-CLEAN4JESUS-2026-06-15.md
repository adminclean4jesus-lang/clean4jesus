# Roadmap Clean4Jesus

Estado del proyecto al **15/06/2026**.

## Resumen Ejecutivo

Clean4Jesus ya paso por un reset importante de producto y visual:

- Existe una pantalla de ingreso donde el escudo es la compuerta principal.
- La navegacion base quedo reorganizada para el MVP en `Hoy`, `Camino`, `Habitos` y `Perfil`.
- La tipografia y el sistema de tarjetas ya se movieron a un lenguaje mas premium y compacto.
- El PIN se ve mejor en Android y sigue siendo la llave para activar o desactivar la proteccion.
- Las pruebas de TypeScript y unitarias siguen pasando.

Lo que aun falta para considerar el producto listo:

- Afinar la deteccion de sitios adultos de larga cola en Android nativo.
- Confirmar el flujo completo en el Pixel 9 con dev build actualizado.
- Convertir habitos en experiencias guiadas por experto.
- Crear login y comunidad con backend real.
- Reforzar seguridad, politicas y moderacion.
- Preparar iOS despues de estabilizar Android.

## Registro Ejecutivo De Sesiones

### Sesion 1 - 15/06/2026

- Se establecio la base del producto con la filosofia de "escudo primero".
- Se definio y documenta el MVP visual y tecnico para Android con foco en bloqueo local.
- Se armo el primer roadmap vivo con etapas, dependencias y riesgos principales.

### Sesion 2 - 16/06/2026

- Se rediseño la interfaz a un lenguaje blanco, calmado y mas editorial.
- Se cambio la tipografia base y se ajusto la jerarquia visual de home, camino, habitos y perfil.
- Se generaron previews y se valido la nueva composicion con tests de TypeScript y unitarios.

### Sesion 3 - 26/06/2026

- Se corrigio el icono nativo de Android para que el APK instale el logo real de Clean4Jesus.
- Se resolvio el conflicto de recursos `ic_launcher_background` que estaba rompiendo el build de EAS.
- Se aclaro el flujo correcto de prueba en celular: usar el QR del dev client en terminal y no el QR del build de EAS para conectar Metro.

### Sesion 4 - 26/06/2026

- Se corrigio el arranque del refugio para que no quede como activo por un valor viejo o incompleto en AsyncStorage.
- Se separo la preparacion del refugio de la activacion real, obligando a pasar por PIN, DNS privado y accesibilidad antes de entrar.
- Se agrego exclusion para apps sensibles como YouTube y Nubank en el servicio nativo de accesibilidad.

### Sesion 5 - 26/06/2026

- Se corrigio el flujo de activacion en Android para que la confirmacion final no dependa de un cuarto boton dentro de `Alert`.
- Se movio la confirmacion "Ya lo active" a la pantalla del refugio para que el usuario la vea y la toque sin perder contexto.
- Se validadon TypeScript, unit tests, smoke e2e y el flujo web antes del siguiente build nativo.

### Sesion 6 - 26/06/2026

- Se agrego un motivo explicito en la pantalla de interrupcion para que el usuario sepa por que se bloqueo el contenido.
- Se paso el motivo desde el servicio de accesibilidad nativo hasta `InterruptionActivity`, diferenciando busqueda, dominio o senal sensible.
- Se subio un nuevo build Android de desarrollo para validar el cambio nativo en el Pixel 9.

## Foto Del Estado Actual

### Ya hecho

- Pantalla de gate con escudo primero.
- Navegacion principal reducida y mas clara.
- Home, Camino, Habitos y Perfil rearmados con una linea visual mas sobria.
- Pantallas de PIN mas legibles.
- Documentacion del flujo de bloqueo Android.
- Pruebas base de TypeScript y unitarias.
- Build de desarrollo Android configurado.
- Version base consolidada como `1.2.0` y documentada en `docs/VERSION-HISTORY.md`.

### Todavia pendiente

- Ajuste fino de interrupcion para dominios long-tail como `erome` y variantes similares.
- Confirmar que la experiencia native build refleje todo lo que ya se documenta.
- Mejorar la pantalla de interrupcion para que se sienta menos tecnica.
- Expandir el escudo desde DNS/accesibilidad hacia bloqueo por apps y horarios.

## Roadmap Por Etapas

### Etapa 1. Estabilizar Escudo Android

Objetivo: que el usuario vea una proteccion confiable y comprensible en el celular.

Entregables:

- Afinar reglas de deteccion de dominios y senales de busqueda.
- Verificar el flujo de accesibilidad en Android nativo.
- Ajustar el disclaimer y el onboarding de permisos.
- Validar el comportamiento en Pixel 9 con dev build.

Exit criteria:

- El usuario entiende por que se pide accesibilidad.
- La pantalla de interrupcion aparece con fiabilidad razonable.
- La app mantiene una guia clara para DNS y permisos.
- El flujo de prueba en celular esta claro y evita QRs viejos o sesiones duplicadas.
- El refugio no debe abrir tabs por una bandera parcial; la activacion debe ser explicita y verificada por el usuario.
- La confirmacion final del refugio debe ser visible en pantalla y no depender de un dialogo limitado del sistema.
- La interrupcion debe explicar el disparador detectado para ayudar al usuario a entender y ajustar el filtro.

### Etapa 2. Habitos 2.0 Con Experto Por Hábito

Objetivo: pasar de checklist a experiencia guiada.

Entregables:

- Ejercicio: coach que pregunta objetivo, nivel, preferencias y arma sugerencias.
- Nutricion: coach que pregunta meta de peso, rutina y ayuda con calorias aproximadas.
- Biblia: plan biblico guiado, no lectura al azar.
- Oracion: oraciones sugeridas segun estado del dia.
- Sueno: tracking de horas dormidas y lectura de descanso.
- Agua: seguimiento simple y motivador.
- Dia limpio: protocolo de emergencia y reflexion.

Decisiones de producto:

- Empezar deterministicamente, con reglas y contenido local.
- No meter IA generativa compleja hasta que el flujo base funcione y se entienda.
- El coach de ejercicio ya tiene su PRD en `docs/COACH-EJERCICIO-PRD.md` y debe servir como patron para los demas habitos.
- El coach de ejercicio ya inicio implementacion como pantalla propia y provider local-ready.
- El MVP del coach de ejercicio ya incluye onboarding, plan diario y registro local de sesion completada.

### Etapa 3. Rachas Y Progreso

Objetivo: que el sistema de progreso sea motivador y confiable.

Entregables:

- Racha actual y racha maxima por habito.
- Dia perfecto cuando se completan todos los habitos.
- Calendario mensual con colores por cumplimiento.
- Persistencia solida en AsyncStorage y tests para no romper calculos.

### Etapa 4. Login Y Comunidad

Objetivo: convertir Clean4Jesus en una experiencia compartida.

Entregables:

- Supabase Auth.
- Perfil de usuario.
- Feed de testimonios y apoyo.
- Reporte y moderacion basica.
- RLS para proteger datos.

### Etapa 5. Seguridad Y Madurez

Objetivo: cerrar brechas y preparar el producto para crecer.

Entregables:

- Ajustes finos de permisos y mensajes.
- Politicas claras de privacidad.
- Mejoras de estabilidad y performance.
- Preparacion para release controlado.

### Etapa 6. iOS Y Produccion

Objetivo: llevar lo estable a iOS y luego a produccion.

Entregables:

- Adaptacion de UX a iOS.
- Revision de diferencias nativas.
- Camino a publicacion.

### Sesion 7. Interrupcion Inmediata Y Rediseno Nativo

Fecha: 2026-06-26

Hecho en esta sesion:

- Se elimino el `Home` automatico antes de lanzar la pantalla de interrupcion, porque eso la estaba mandando a segundo plano y solo aparecia al volver desde recientes.
- `InterruptionActivity` se rehizo con una estetica clara, mas limpia y mas calmada para dejar atras el look viejo de Android.
- Se dejo el motivo del bloqueo como parte visible de la pantalla, con el lanzamiento nativo pensado para sentirse inmediato.

### Sesion 8. Allowlist De Apps Confiables

Fecha: 2026-06-26

Hecho en esta sesion:

- Se amplio la allowlist de accesibilidad para bancos y apps sensibles, con el fin de evitar que Clean4Jesus provoque avisos ajenos o interrumpa flujos confiables.
- Se reforzo la exencion de YouTube y variantes para que los comentarios no queden atrapados por heuristicas demasiado agresivas.
- Se guardo el aprendizaje de que un bloqueador serio debe ser estricto con contenido adulto pero muy cuidadoso con apps financieras y servicios de confianza.

### Sesion 9. Allowlist Por Categoria Y Señales Normalizadas

Fecha: 2026-06-28

Hecho en esta sesion:

- Se reorganizo el servicio de accesibilidad para decidir por criterios y categorias, no solo por listas sueltas.
- Se amplio la allowlist conceptual para medios confiables y servicios financieros, reduciendo falsos positivos en apps sensibles.
- Se alineo la deteccion de señales adultas con el texto normalizado para que dominios y palabras clave no dependan de coincidencias accidentales.

### Sesion 10. Bloqueo Con Salida Best-Effort Mas Firme

Fecha: 2026-06-28

Hecho en esta sesion:

- Se ajusto el flujo nativo para intentar sacar la app bloqueada del frente antes de mostrar la interrupcion.
- Se reforzo la salida best-effort con mas acciones de sistema para que TikTok, navegadores y apps similares salgan mejor del foco.
- Se documento como checkpoint versionado que la proteccion debe conservar lo que ya funciona y solo sumar el nuevo comportamiento pedido.

### Sesion 11. APK Local Con Ruta Corta

Fecha: 2026-06-28

Hecho en esta sesion:

- Se instalo JDK 17 en la maquina para resolver la ausencia de Java en el entorno local.
- Se creo una ruta corta temporal para evitar el error de longitud de archivos de Gradle/Ninja en OneDrive.
- Se genero con exito un APK local debug en `C:\\c4j\\android\\app\\build\\outputs\\apk\\debug\\app-debug.apk`.

### Sesion 12. Allowlist Por Prefijo Para Apps Confiables

Fecha: 2026-06-28

Hecho en esta sesion:

- Se amplio la allowlist nativa con prefijos estables para familias de paquetes de YouTube y Nubank.
- Se redujo la dependencia en coincidencias sueltas de texto para evitar falsos positivos en servicios confiables.
- Se verifico la compilacion Kotlin del modulo Android para asegurar que el ajuste quedo sano.

### Sesion 13. Bloqueo Solo Para Browsers Y Redes Sociales

Fecha: 2026-06-28

Hecho en esta sesion:

- Se acoto el servicio de accesibilidad a navegadores y redes sociales, dejando fuera apps bancarias y medios confiables.
- Se reforzo la allowlist de YouTube y Nubank para que el bloqueo no interrumpa apps sensibles ni comentarios confiables.
- Se versiono el parche como `1.1.1` para mantener el checkpoint visible en la app y en la documentacion.

### Sesion 14. Reduccion De Huella Nativa De Accesibilidad

Fecha: 2026-06-28

Hecho en esta sesion:

- Se limito el Accessibility Service desde XML con `android:packageNames`, no solo desde el codigo Kotlin.
- Se quito `flagRetrieveInteractiveWindows` y permisos Android no usados para reducir falsos positivos en apps sensibles.
- Se versiono el cambio como `1.1.2` y se dejo documentado que la allowlist debe existir tambien a nivel nativo.

### Sesion 15. Modo Banca Y Checkpoint YouTube

Fecha: 2026-06-28

Hecho en esta sesion:

- Se confirmo YouTube como checkpoint funcional: comentarios visibles y fuera del bloqueo.
- Se definio Modo banca como arquitectura para bancos que bloquean cualquier servicio de accesibilidad activo.
- Se agrego una tarjeta de Modo banca en Ajustes para pausar accesibilidad, usar el banco y reactivar proteccion.

### Sesion 16. Arquitectura En Dos Capas VPN/DNS

Fecha: 2026-06-28

Hecho en esta sesion:

- Se eligio la opcion 3: VPN/DNS como proteccion base y Accesibilidad como capa de interrupcion visual.
- Se agrego un `VpnService` nativo Android para DNS local hacia CleanBrowsing Family sin tocar el servicio de Accesibilidad que ya funcionaba.
- Se versiono el cambio como `1.2.0` para probar la proteccion base en Pixel 9 sin perder el checkpoint de YouTube.

### Sesion 17. Checks De Proteccion Y Modo Banca Real

Fecha: 2026-06-28

Hecho en esta sesion:

- Se agrego lectura visual por capas del refugio: PIN, VPN local, DNS y Accesibilidad deben verse como checks independientes.
- Se reforzo la arquitectura de banca: el modo banca intenta pausar Accesibilidad con `disableSelf()` y deja activa la VPN/DNS como proteccion base.
- Se versiono el cambio como `1.2.2` y se genero APK local validado con versionCode `8`, conservando el checkpoint de YouTube y la pantalla de bloqueo existente.

### Sesion 18. Interrupcion Visible Despues Del Cierre

Fecha: 2026-06-28

Hecho en esta sesion:

- Se encontro que la pantalla de interrupcion se abria antes de que terminaran las acciones `HOME`, por eso quedaba escondida y el usuario terminaba en launcher.
- Se ajusto el timing para ejecutar primero la salida best-effort de la app bloqueada y despues lanzar `InterruptionActivity`.
- Se versiono el build como `1.2.3` y se genero APK debug local validado con versionCode `9`.

### Sesion 19. Refugio Compacto Y Flujo PIN

Fecha: 2026-06-28

Hecho en esta sesion:

- Se corrigio el retorno despues de crear PIN para volver directo al setup del refugio.
- Se compacto la pantalla principal del Refugio: cobertura visible, detalles tecnicos en desplegable y menos tarjetas fijas.
- Se versiono el build como `1.2.4` y se genero APK debug local validado con versionCode `10`.

### Sesion 20. Icono Adaptativo Multi-Dispositivo

Fecha: 2026-06-29

Hecho en esta sesion:

- Se corrigio el icono de launcher con criterio de adaptive icon, no calibrado solo para Pixel.
- Se redujo y centro el simbolo dentro de una zona segura conservadora para que funcione en circulo, squircle y otras mascaras.
- Se genero APK debug local `1.2.4` con versionCode `14` para validar el nuevo icono sin tocar la logica que ya funciona.

### Sesion 21. Huella Minima De Accesibilidad

Fecha: 2026-06-30

Hecho en esta sesion:

- Se investigo por que YouTube volvio a restringir comentarios aunque no estaba listado en el XML del servicio.
- Se encontro que la capacidad global `canRetrieveWindowContent=true` podia seguir siendo detectada por apps sensibles.
- Se preparo `1.2.5` reduciendo esa capacidad a `false`, manteniendo el icono correcto y sin tocar el flujo visual que ya funciona.

### Sesion 22. DNS Sin YouTube Restricted Mode

Fecha: 2026-06-30

Hecho en esta sesion:

- Se compararon los APKs guardados y se confirmo que YouTube no estaba incluido en `packageNames`.
- Se identifico la causa mas probable de comentarios ocultos: CleanBrowsing Family puede forzar YouTube Restricted Mode.
- Se preparo `1.2.6` usando Cloudflare Family como DNS base para mantener bloqueo adulto sin romper el checkpoint de comentarios de YouTube.

### Sesion 23. Refugio De Tres Capas

Fecha: 2026-06-30

Hecho en esta sesion:

- Se simplifico el flujo principal del Refugio a PIN, VPN local y Accesibilidad.
- DNS privado manual paso a Ajustes avanzados con disclaimer por riesgo de datos moviles/YouTube.
- Se rediseño el desplegable de capas como botones centrados y compactos para quitar ruido visual.

### Sesion 24. Checkpoint Escudo 1.2.7

Fecha: 2026-06-30

Hecho en esta sesion:

- Se declaro **Clean4Jesus 1.2.7** como checkpoint estable del escudo: no tocar bloqueo, VPN, Accesibilidad, pantalla de interrupcion ni allowlists sin instruccion explicita.
- Se retiro Modo banca de Ajustes porque el flujo actual ya no lo necesita.
- Se dejo el desplegable de capas del Refugio como botones separados y simetricos para reducir ruido visual.

### Sesion 25. Inicio Del Modulo Palabra

Fecha: 2026-06-30

Hecho en esta sesion:

- Se cerro Refugio como hito estable y se comenzo el trabajo de Palabra sin tocar el core del escudo.
- Se transformo Palabra en una experiencia guiada con racha, mejor racha, estado de oracion, progreso del dia y acciones separadas.
- Se enriquecio el contenido devocional con referencia biblica, oracion guiada, tema y practica concreta.

### Sesion 26. Planes Devocionales Local-First

Fecha: 2026-06-30

Hecho en esta sesion:

- Se agregaron ocho planes devocionales de siete dias como base local-first.
- Se implemento inscripcion, progreso, dias completados y dias pendientes con AsyncStorage.
- Se documento la arquitectura futura de Palabra para migrar contenido, autores e inscripciones a Supabase.

### Sesion 27. Contenido Profundo Para Planes

Fecha: 2026-06-30

Hecho en esta sesion:

- Se reemplazo el contenido breve de los ocho planes por lecturas pastorales mas extensas, pensadas para 2-3 minutos por dia.
- Cada dia quedo con lectura base NTV por referencia, reflexion cristocentrica, pregunta, oracion y practica concreta.
- Se documento la regla editorial de no copiar bloques largos de NTV sin validar permiso/licencia antes de produccion.

### Sesion 28. UX De Planes Por Dia

Fecha: 2026-06-30

Hecho en esta sesion:

- Se cambio el detalle de plan para no mostrar los siete devocionales completos en una sola pantalla.
- Se agrego una pantalla individual de lectura por dia con CTA final para marcar el dia como terminado.
- Se corrigio el calendario de planes para usar fecha local del dispositivo, evitando que el dia 1 salte a manana por UTC.

### Sesion 29. Cierre De Palabra Y APK Rotado

Fecha: 2026-06-30

Hecho en esta sesion:

- Se dejo como checkpoint la UX de planes devocionales: portada, inscripcion, checklist y lectura individual por dia.
- Se genero un APK debug/dev-client para probar los ajustes de Palabra sin tocar el checkpoint congelado del Refugio.
- Se activo la politica de artefactos limpios: solo conservar `Clean4Jesus-current.apk` y `Clean4Jesus-previous.apk`.

### Sesion 30. Proteccion De Apps MVP

Fecha: 2026-07-07

Hecho en esta sesion:

- Se agrego una pantalla de Proteccion de apps desde Ajustes para bloquear o limitar redes sociales y navegadores vulnerables.
- Se creo persistencia local de reglas por app y sincronizacion nativa hacia el servicio de Accesibilidad.
- Se mantuvo el checkpoint del Refugio 1.2.7: bancos, YouTube y apps sensibles siguen fuera del alcance de esta nueva capa.

### Sesion 31. Proteccion De Apps QA Gate

Fecha: 2026-07-08

Hecho en esta sesion:

- Se rehizo la tarjeta visual de limites para mostrar usados, restantes y progreso del dia con mejor claridad.
- Se cerro un bug de producto critico: ahora no se pueden crear reglas por app sin tener antes el PIN del guardian.
- Se institucionalizo el preflight antes del APK con red team, QA, recorrido funcional y build local validado en ruta corta.

### Sesion 32. Palabra Con Direccion Editorial

Fecha: 2026-07-09

Hecho en esta sesion:

- Se dejo como checkpoint la base de notificaciones de Palabra en version 1.2.12: small icon Android, permiso del sistema y preview de recordatorio aprobados.
- Se rehizo la experiencia visual de Palabra con una direccion mas editorial y contemplativa: hero con mas presencia, plan activo mas claro y catalogo de planes con identidad propia.
- Se agrego una capa reusable de arte para planes y lecturas, y se validaron previews reales antes de cerrar la sesion sin tocar el checkpoint congelado del Refugio.

## Priorizacion

Prioridad alta:

1. Escudo Android nativo.
2. Rachas y persistencia.
3. Habitos con coach.
4. Login y comunidad.

Prioridad media:

1. Seguridad avanzada.
2. iOS.
3. Produccion.

## Dependencias Clave

- Android dev build para todo lo nativo.
- Backend Supabase para login y comunidad.
- Diseno consistente para los nuevos coaches.
- Tests para rachas y persistencia.

## Riesgos

- Esperar bloqueo total de Chrome como si fuera root.
- Crear coaches demasiado abstractos o demasiado complejos desde el inicio.
- Meter backend antes de que la experiencia local sea estable.
- Cambiar demasiado a la vez y perder claridad visual.

## Proxima Sesion

Orden recomendado:

1. Afinar el bloqueo de dominios y la interrupcion nativa en Android.
2. Mejorar las rachas.
3. Rehacer habitos con expertos por categoria.
4. Subir a Supabase login y comunidad.

## Definicion De "Full 100%"

Considero que Clean4Jesus esta listo para siguiente fase cuando:

- El escudo funciona de forma entendible en Android.
- Los habitos se sienten guiados y utiles.
- Las rachas no fallan.
- Existe login real.
- La comunidad tiene moderacion.
- La app se ve coherente en celular.

## Version 1.2.0

La version 1.2.0 queda como una base nueva de arquitectura del producto:

- escudo funcional en Android,
- interrupcion clara,
- allowlist por categoria enfocada en navegadores y redes sociales tambien desde el XML nativo,
- VPN/DNS local como proteccion base independiente de Accesibilidad,
- UX consolidada,
- base documental lista para iterar sin perder estabilidad.

### Sesion 33. Profesionalizacion Del Repositorio

Fecha: 2026-07-13

Hecho en esta sesion:

- Se hizo una auditoria formal del proyecto y se dejo escrita en `docs/AUDITORIA-PROYECTO-2026-07-13.md`.
- Se agrego `README.md`, checklist de release y una fuente compartida de version visible para que el proyecto sea mas presentable y transferible.
- Se endurecio el manejo del PIN del guardian con almacenamiento seguro local y hash, se desactivo `allowBackup` y se limpiaron artefactos regenerables del repo.

### Sesion 34. Palabra Y Comunidad Mas Vivas

Fecha: 2026-07-13

Hecho en esta sesion:

- Se versiono la iteracion `1.2.13` con recordatorios de planes mas inteligentes, capaces de retomar dias pendientes y abrir el dia correcto del plan.
- Se mejoro `Palabra` en home y detalle de plan para que el usuario vea claramente que leer hoy, que tiene atrasado y cual es el hilo del plan.
- Se rehizo el feed de `Comunidad` con metricas, filtros, acciones rapidas y perfiles seed mas creibles para pruebas de UX antes del backend real.

### Sesion 35. Motion Base Del Producto

Fecha: 2026-07-13

Hecho en esta sesion:

- Se agrego una capa base de motion calmado para cargas, entradas de pantalla y feedback de completado sin tocar la logica del escudo.
- `Refugio`, `Palabra`, `Comunidad`, `Ajustes` y pantallas de planes ahora entran con transiciones mas suaves y menos sensacion de app plana.
- Se cerro la iteracion como `1.2.14`, lista para APK local de prueba enfocado en animacion y percepcion premium.

### Sesion 36. Parche De Regresion Visual En Footer

Fecha: 2026-07-13

Hecho en esta sesion:

- Se detecto y corrigio una regresion real del footer persistente en Android causada por el layout del contenedor inferior, no por la logica del escudo.
- Se rehizo la base del footer con `safe area` manual, altura fija y espaciado mas estable para evitar tabs pegados o bloques blancos abajo.
- Se versiono este parche como `1.2.15` para separar claramente la mejora visual de `1.2.14` del fix posterior.

### Sesion 37. Cierre Visual Del Motion

Fecha: 2026-07-13

Hecho en esta sesion:

- Se corrigio el layout base para que el espacio inferior sea dinamico y no dependa de un numero fijo cuando hay footer o no.
- Se suavizaron las cargas internas con modo contextual para conservar la animacion sin romper la percepcion de pantalla en tabs y planes.
- Se cerro la iteracion como `1.2.16`, lista para APK final de sesion con visual revisada por previews antes del build.

### Sesion 38. Rollback Fallido Del Motion

Fecha: 2026-07-14

Hecho en esta sesion:

- Se intento volver a una base sin motion con la version `1.2.17`, pero el resultado no quedo aprobado por producto.
- Quedaron regresiones visibles en Android real: footer flotante y mal espaciado, labels pegados, cortes en tarjetas y truncamiento en acciones como `Ver planes`.
- La proxima sesion debe arrancar restaurando el baseline visual previo al motion antes de tocar cualquier feature nueva.

### Sesion 39. Restauracion Del Baseline Visual

Fecha: 2026-07-14

Completada:

- Se reemplazo el footer flotante por una barra inferior fija, de ancho completo y cuatro columnas legibles, sin tocar Refugio ni la logica de bloqueo.
- Se unifico el espacio inferior de pantallas con footer y se corrigio el encabezado de planes para que `Ver planes` no se trunque.
- Se agrego una prueba E2E movil de regresion para el footer; TypeScript, 19 pruebas unitarias y las 3 pruebas E2E pasan.
- Producto aprobo los previews y se genero el APK local `1.2.18` para ARM64, conservando solo el APK actual y el anterior.

### Sesion 40. QA Visual Y Eliminacion De Motion

Fecha: 2026-07-14

Hecho en esta sesion:

- Se eliminaron las APIs de animacion activas y se dejo solo carga estatica para evitar nuevas regresiones de layout.
- Se estabilizo el footer usando una altura compartida y se simplificaron Planes y Comunidad para que no haya columnas ni textos comprimidos.
- Se valido `1.2.19` con pruebas unitarias, E2E movil, export web y revisiones adversariales separadas antes del APK.

### Sesion 41. Footer Estructural Y Catalogo De Planes

Fecha: 2026-07-14

Hecho en esta sesion:

- Se rehizo el footer como cuatro zonas tactiles de ancho fijo para impedir labels pegados en Android.
- Se rediseño el catalogo de Planes como una lista editorial mas clara y menos repetitiva.
- Se agregaron controles E2E de contencion de labels y se versiono el cambio como `1.2.20`.
- QA completo aprobado y APK local ARM64 generado, conservando solamente los artefactos `current` y `previous`.

### Sesion 42. Correccion Android Del Catalogo De Planes

Fecha: 2026-07-14

Hecho en esta sesion:

- Se detecto en Android que la fila editorial de `1.2.20` reordenaba imagen y texto de forma incorrecta.
- Se reemplazo por tarjetas con arte anclado y texto reservado, eliminando la dependencia de ese reflujo.
- Se agrego una prueba de no solapamiento y se versiono la correccion como `1.2.21`.
- Se genero y verifico el APK local ARM64, conservando los artefactos `current` y `previous`.

### Sesion 43. Identidad De Planes

Fecha: 2026-07-14

Hecho en esta sesion:

- Se dio a cada plan una identidad tonal visible para evitar que el catalogo se perciba como una lista plana.
- Se reforzo la jerarquia de cada tarjeta con guia lateral, borde y accion separada.
- Se genero y verifico el APK local ARM64 `1.2.22`, conservando `1.2.21` como artefacto anterior.

### Sesion 44. Responsive Android De Footer Y Planes

Fecha: 2026-07-14

Hecho en esta sesion:

- Se corrigio la causa estructural que agrupaba el footer hacia la izquierda: cada tab recibe un ancho calculado desde la ventana real.
- Se reconstruyo el catalogo en flujo vertical estable, eliminando superposiciones, porcentajes fragiles y posiciones absolutas.
- Se validaron `320`, `360`, `393` y `412` dp con pruebas de limites, TypeScript, unitarias, E2E y export web.
- Se genero y verifico el APK local ARM64 `1.2.23`, conservando `1.2.22` como artefacto anterior.

### Sesion 45. Footer Android Por Cuadrantes

Fecha: 2026-07-14

Hecho en esta sesion:

- Producto aprobo Planes de `1.2.23`, pero rechazo el footer porque Android seguia comprimiendo sus destinos a la izquierda.
- Se retiro la geometria dinamica del `Pressable` y se reemplazo por cuatro cuadrantes absolutos contiguos dentro de una barra de ancho completo.
- TypeScript, 21 pruebas unitarias, 7 E2E y export web quedaron aprobados; Planes no fue modificado.
- Se genero y verifico el APK local ARM64 `1.2.24`; producto aprobo footer y Planes en Pixel y ambos quedan como checkpoint protegido.

### Sesion 46. Inicio De Comunidad Real 1.3

Fecha: 2026-07-14

En progreso:

- Se retiro la dependencia de perfiles simulados y se construyo Supabase Auth con sesion persistente, registro, login, logout y perfil editable.
- Se implemento el dominio comunitario real: publicaciones, pedidos de oracion, respuestas, reportes y estados de carga/error/vacio.
- Se creo una migracion Postgres con RLS y pruebas de seguridad; falta enlazar el proyecto Supabase del producto y ejecutar QA multiusuario antes del APK.

### Sesion 47. Endurecimiento Profesional De Auth 1.3.1

Fecha: 2026-07-14

Hecho en esta sesion:

- Auditoria adversarial de arquitectura Auth/Supabase y correccion de riesgos altos: SecureStore, PKCE, deep links, confirmacion y recuperacion.
- Minimo privilegio por columna, racha sensible fuera del perfil publico y cuotas antiabuso aplicadas en Postgres.
- Eliminacion de cuenta mediante Edge Function, prueba RLS con dos usuarios y QA local completo aprobado.

Siguiente hito:

- Configurar SMTP/CAPTCHA, construir moderacion operativa y aprobar documentos legales antes de una beta.

### Sesion 48. Supabase Real Desplegado

Fecha: 2026-07-14

Hecho en esta sesion:

- Se creo y enlazo `Clean4Jesus` en la organizacion personal de Emmanuel Lopez sin modificar proyectos existentes.
- Se desplegaron migraciones, Auth endurecido y `delete-account`; asesores de seguridad y rendimiento quedaron sin hallazgos.
- La prueba adversarial remota y el QA completo aprobaron aislamiento, eliminacion de cuenta, TypeScript, 36 unitarias, 7 E2E y export web.

### Sesion 49. Moderacion Comunitaria 1.3.2

Fecha: 2026-07-14

Hecho en esta sesion:

- Se desplego una arquitectura de moderacion con roles privados, casos agrupados, evidencia durable y auditoria inmutable.
- Se protegieron las acciones con JWT, `auth.uid()`, idempotencia, control de version y MFA para restauraciones administrativas.
- La prueba adversarial remota aprobo aislamiento, permisos, concurrencia y borrado de cuenta; quedaron preparados runbook, guias y borradores legales.

Siguiente hito:

- Configurar SMTP y CAPTCHA con credenciales del proveedor, y construir la consola interna para operar la cola antes de abrir la beta.

### Sesion 50. Auth Y Comunidad Endurecidos 1.3.3

Fecha: 2026-07-14

Hecho en esta sesion:

- Se cerraron bypasses de recuperacion, carreras de sesion y borrado de cuenta sin reautenticacion real en servidor.
- Se reforzaron RLS, contenido oculto, evidencia, idempotencia y cuotas concurrentes mediante migraciones aditivas.
- QA local y remoto aprobo 58 unitarias, 7 E2E, export web, lint de base y ataques con identidades temporales; no se tocaron los checkpoints visuales.

Siguiente hito:

- Configurar SMTP/CAPTCHA y construir la consola interna de moderacion antes de una beta controlada.

### Sesion 51. QA Integral Y Cierre Documentado De 1.3.3

Fecha: 2026-07-14

Hecho en esta sesion:

- Se aprobaron TypeScript, 58 pruebas unitarias, 7 E2E, export web, lint de Supabase y 16 etapas de ataques remotos con identidades temporales.
- Dos revisiones adversariales detectaron riesgos pendientes en el checkpoint de Refugio y en privacidad/moderacion de Comunidad; no se genero APK para no ignorar un resultado `NO-GO`.
- Se creo `docs/INFORME-TECNICO-SESION-2026-07-14.pdf` con explicacion ejecutiva, tecnica y accesible de todo el trabajo, decisiones y siguientes pasos.

Siguiente hito:

- Autorizar el alcance minimo sobre Refugio, corregir privacidad/moderacion de Comunidad y repetir el preflight completo antes del siguiente APK.

### Sesion 52. Privacidad De Engagement Comunitario

Fecha: 2026-07-15

Hecho en esta sesion:

- Se cerro la lectura directa de identidades en `community_prayers` y se incorporo una RPC agregada para conteos y estado propio.
- El servicio comunitario incorpora reporte de comentarios y borrado de publicaciones/comentarios propios sin cambios de UI.
- La prueba multiusuario cubre que los apoyos individuales no son legibles y que el feed conserva sus agregados.

### Sesion 53. Candidata Registrable 1.3.4

Fecha: 2026-07-15

Hecho en esta sesion:

- Se completo el recorrido registrable de Auth y Comunidad real con confirmacion, perfil, publicaciones, comentarios, apoyo, reportes y borrado propio.
- Se cerro la enumeracion de perfiles y UUID mediante proyecciones publicas de feed; diez migraciones, lint y 17 etapas remotas de seguridad aprobaron.
- Se endurecieron los casos limite nativos de conteo de uso y DNS sin ampliar Accesibilidad a YouTube o banca; Refugio, Palabra, Planes y footer conservaron su checkpoint.

Siguiente hito:

- Configurar SMTP y CAPTCHA antes de beta publica, y construir la consola interna para operar la moderacion.

### Sesion 54. APK Interna 1.3.4 Aprobada

Fecha: 2026-07-15

Hecho en esta sesion:

- Producto confirmo en Android que registro, login y Comunidad funcionan correctamente; `1.3.4` queda guardada como checkpoint interno.
- QA final aprobo 70 pruebas unitarias, 7 E2E, TypeScript, export web, Expo Doctor 17/17 y dos revisiones adversariales con resultado GO.
- Se genero y verifico la APK debug `1.3.4` (`versionCode 39`) y se documento la diferencia entre LAN, tunnel y futura APK de produccion.

Siguiente hito:

- Preparar SMTP/CAPTCHA y consola operativa de moderacion antes de abrir una beta externa.

### Sesion 55. Endurecimiento Del PIN Para Falsos Positivos

Fecha: 2026-07-17

Hecho en esta sesion:

- Se redujo la concesion por falso positivo de varios minutos a 20 segundos para evitar que el PIN se convierta en una ventana de recaida.
- La excepcion sigue siendo solo para la huella exacta del incidente; el Refugio no se apaga ni se libera globalmente.
- Se actualizaron directivas, roadmap operativo y se valido el cambio con la suite unitaria completa: 101 pruebas aprobadas.

Siguiente hito:

- Probar este comportamiento en APK real y seguir afinando falsos positivos inocentes sin tocar checkpoints ya aprobados.

### Sesion 56. Capturas Seguras En Interrupcion

Fecha: 2026-07-25

Hecho en esta sesion:

- Se habilitaron capturas de la pantalla de interrupcion y del rescate para facilitar QA, soporte y revision visual.
- La zona del PIN permanece protegida dinamicamente con `FLAG_SECURE` y se incorporo una advertencia sobre imagenes personalizadas.
- Se genero el APK interno actual y se aprobaron 154 pruebas unitarias, TypeScript y compilacion Android sin alterar el motor de proteccion.

Siguiente hito:

- Continuar la preparacion iOS cuando Apple active la membresia, manteniendo Android y sus checkpoints congelados.
