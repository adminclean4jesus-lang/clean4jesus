# Clean4Jesus - Plan Maestro Hacia Play Store

Fecha de corte: 2026-07-21  
Version interna: `1.3.13`  
Meta: publicar Clean4Jesus en Google Play para Android, sin QR, sin Metro y sin depender de un computador.

## Cierre Legal Y De Privacidad - 2026-07-23

### Completado

- Documentos publicos versionados y desplegados en `legal.clean4jesus.com`.
- Centro legal accesible desde la app y sin autenticacion.
- Consentimiento explicito para correo y Google, evidencia versionada y reaceptacion obligatoria en Comunidad.
- Eliminacion desde la app y ruta web publica de eliminacion.
- Retencion automatica en Supabase y procedimientos de privacidad, soporte, moderacion y crisis.
- Inventario operativo para Data Safety, VPN, Accesibilidad, UGC y Child Safety.

### Puerta Antes Del Lanzamiento Abierto

- Enrutar y atender los tres buzones publicos.
- Revision juridica profesional en Colombia y revision territorial al expandir paises.
- Resolver licencias NTV y demas contenido editorial.
- Completar formularios y declaraciones en Play Console y App Store Connect.
- Ejecutar eliminacion de una cuenta QA y conservar evidencia.

### Proxima Fase

Iniciar ADR y prueba de viabilidad iOS para Family Controls, Managed Settings, Device Activity y Network Extension, sin prometer paridad tecnica con AccessibilityService.

## Resumen Ejecutivo

Clean4Jesus ya tiene tres pilares funcionales: Refugio, Palabra y Comunidad. El trabajo pendiente no consiste en rehacerlos, sino en cerrar las salidas supervisadas del bloqueo, endurecer la beta, completar idiomas y cumplimiento, probar en varios Android y preparar una publicacion formal.

La ruta recomendada tiene siete fases:

1. Cerrar el core de proteccion.
2. Cerrar seguridad de Auth y Comunidad.
3. Cerrar privacidad, legal y declaraciones de Google Play.
4. Completar espanol, ingles y frances.
5. Pulir producto y funciones diferenciales.
6. Ejecutar QA multi-dispositivo y preparar el release.
7. Lanzar beta cerrada, corregir y publicar.

Estimacion ejecutiva: **8 a 12 semanas**, incluyendo el periodo de prueba cerrada de Google Play. Las fechas dependen de la revision legal, la disponibilidad de testers y los hallazgos reales en dispositivos.

## Auditoria De Salida - 2026-07-21

Estado ejecutivo: **GO para alpha interna supervisada; NO-GO para beta publica**.

- El AAB release optimizado de medicion ARM64 pesa `34.07 MB` (`32.49 MiB`). El APK debug universal de aproximadamente `216 MB` no representa la descarga desde Google Play.
- El AAB actual usa firma de depuracion y sirve exclusivamente para medir. Antes de subir a Play se debe crear la clave release definitiva y habilitar Play App Signing.
- El proyecto ya compila con `targetSdk 36`, pero faltan cerrar legal/Data Safety, disclosure y declaraciones de Accesibilidad/VPN, consentimiento versionado, seguridad del PIN, operacion de crisis y QA multidispositivo.
- La VPN local usa DNS upstream por UDP/53. Antes de beta publica se debe migrar a DoH/DoT o validar formalmente el cumplimiento exacto de la politica de `VpnService`.
- No se recomienda abrir IA local, widget o iOS antes de completar estas puertas. La prioridad es lograr una beta Android confiable y admitida por Google Play.

Artefacto de medicion: `artifacts/aab/measurement/Clean4Jesus-1.3.13-arm64-measurement.aab`.

## Norte Del Producto

Clean4Jesus ayuda a hombres y mujeres a caminar hacia la libertad de la pornografia y la masturbacion mediante:

- proteccion local del dispositivo;
- acompañamiento espiritual diario;
- comunidad segura y moderada;
- responsabilidad con una persona de confianza.

Una funcion solo entra a beta si fortalece uno de esos cuatro resultados.

## Checkpoints Protegidos

No se modifican salvo que una tarea lo exija y tenga pruebas de regresion:

- Refugio principal con PIN, VPN local y Accesibilidad.
- Pantalla de interrupcion base y salida best-effort de la app bloqueada.
- YouTube y aplicaciones bancarias fuera del bloqueo agresivo.
- Footer Android fijo y catalogo de Planes aprobado.
- Palabra, devocional diario y planes de siete dias.
- Notificaciones locales con icono correcto.
- Supabase Auth, perfiles, publicaciones, comentarios, oraciones, reportes y borrado de cuenta.
- SMTP propio, dominio y consola de moderacion.

## Estado Por Pilar

| Pilar | Estado | Falta principal |
| --- | --- | --- |
| Refugio | Funcional / congelado | Desbloqueo temporal, personalizacion y persona de confianza |
| Palabra | Funcional / catalogo remoto | Devocional diario remoto, QA editorial y panel de publicacion |
| Comunidad | Funcional / validacion | Turnstile activo, moderacion operativa y legal final |
| Auth | Funcional / validacion | Prueba Android completa, version gate y CAPTCHA obligatorio |
| Notificaciones | Base funcional | Automatizacion de recordatorios y alertas consentidas |
| Idiomas | Fundacion creada | Migrar toda la UI y contenido a ES/EN/FR |
| Play Store | Pendiente | Cuenta, declaraciones, AAB, ficha, testing y revision |

## Cierre De Sesion - 2026-07-18

- Se simplifico Refugio y Ajustes: se retiraron accesos y bloques que no pertenecian a cada pantalla, y se concentro la configuracion en Proteccion, Persona de confianza, Pantalla de interrupcion, Idioma y Ajustes avanzados.
- Se corrigieron textos visibles en espanol para conservar tildes y la letra enie, y se preparo el selector global de apariencia claro/oscuro.
- Checkpoint parcial: Refugio, Palabra, Comunidad, Auth, footer y proteccion no deben cambiarse durante la siguiente correccion visual. El modo oscuro y el Centro de control de Ajustes NO estan aprobados: faltan contraste, jerarquia, organizacion y validacion real en Android.

## Priorizacion

### P0 - Bloquea La Beta

- PIN de interrupcion funcional: correccion puntual de falsos positivos con 20 segundos exactos por incidente y desbloqueo de 15 minutos solo para apps bloqueadas deliberadamente.
- Persona de confianza con consentimiento y reglas claras.
- Turnstile probado en Android y activado en Supabase.
- Version gate para bloquear clientes antiguos incompatibles.
- Politica de Privacidad, Terminos, normas comunitarias y eliminacion web.
- Declaraciones de Accesibilidad y `VpnService` para Google Play.
- Moderadores con MFA y simulacro de moderacion.
- Release firmado y QA en multiples dispositivos.

### P1 - Debe Estar En La Beta Candidata

- Pantalla de bloqueo personalizable con frase, versiculo e imagen.
- Alertas a la persona de confianza bajo consentimiento explicito.
- Espanol, ingles y frances completos.
- Recordatorios reales de Palabra y planes.
- Observabilidad de errores y analitica minima respetuosa de privacidad.
- Accesibilidad visual: contraste, tamanos de texto y lectores de pantalla.

### P2 - Diferenciadores Despues De Estabilizar P0/P1

- Modo oscuro global.
- Widget Android.
- Cancion o recurso cristiano semanal.
- Panel de acompañamiento para la persona de confianza.
- Mayor precision de limites de uso con `UsageStatsManager`, si se conserva esa promesa en beta.

### Fuera De La Primera Beta

- iOS.
- Biblia completa dentro de la app.
- IA generativa publicada sin revision editorial.
- Monetizacion.
- Login con Apple queda fuera de alcance por ahora. La estrategia vigente es Google OAuth mas correo y contrasena.
- Passkeys.

## Fase 1 - Core De Proteccion

Duracion estimada: 1 a 2 semanas.

### 1.1 Desbloqueo Temporal Por PIN

Trabajo:

- Reparar el CTA de PIN en `InterruptionActivity`.
- Validar el hash del PIN del guardian, nunca el PIN en texto plano.
- Para una app bloqueada deliberadamente, permitir solo esa app durante 15 minutos.
- Para una deteccion textual marcada como falsa, aprobar solo la huella exacta del incidente durante 20 segundos sin apagar el Refugio.
- Exigir coincidencia por palabras completas para evitar subcadenas inocuas como `adultos` o `seguros` + `excursiones`.
- Mostrar tiempo restante y volver a bloquear al vencer.
- Evitar que el permiso temporal desactive el Refugio completo.

Criterio de terminado:

- PIN incorrecto no cambia nada.
- PIN correcto ante una regla deliberada libera solo esa app y solo por 15 minutos.
- PIN correcto ante un falso positivo permite únicamente ese incidente; otra pantalla o señal vuelve a bloquear.
- Reiniciar o cerrar Clean4Jesus no extiende el permiso.
- El flujo funciona en navegador y red social sin romper bancos ni YouTube.

### 1.2 Persona De Confianza

Trabajo:

- Diseñar invitacion y aceptacion explicita.
- Separar propietario del dispositivo y guardian.
- Definir recuperacion segura si se pierde el acceso del guardian.
- Guardar consentimiento, fecha y version de las reglas.

Criterio de terminado:

- Nadie recibe datos ni alertas sin aceptar.
- El usuario entiende que puede revocar la relacion.
- El guardian nunca ve historial de navegacion, mensajes ni busquedas.

### 1.3 Pantalla De Interrupcion Personalizable

Trabajo:

- Frase o versiculo personalizado.
- Imagen elegida desde la galeria y guardada localmente.
- Vista previa y opcion de restaurar el diseño original.
- Fallback seguro si la imagen fue eliminada o no carga.

Criterio de terminado:

- La pantalla aparece inmediatamente y conserva el motivo del bloqueo.
- La personalizacion no filtra imagenes ni texto a Supabase.
- Funciona sin internet y en diferentes tamaños Android.

### 1.4 Alertas De Riesgo

Trabajo:

- Definir umbral inicial: recomendacion, tres bloqueos en 30 minutos.
- Enviar una alerta sobria, sin revelar pagina, termino ni contenido.
- Agregar cooldown para evitar spam.
- Permitir configurar o desactivar el umbral con reglas de guardian.

Criterio de terminado:

- La alerta informa necesidad de apoyo, no expone informacion sensible.
- Existe consentimiento de ambas personas.
- Reintentos y fallos de red no duplican alertas.

### Puerta GO/NO-GO Fase 1

Prueba real en Pixel 9 y al menos otro Android. Deben aprobar bloqueo, desbloqueo temporal, vencimiento, personalizacion, alertas y regresiones de banca/YouTube.

### Estado De Implementacion - 2026-07-16

- **Implementado:** desbloqueo de 15 minutos limitado al paquete exacto, con vencimiento monotonicamente seguro y restauracion tras reiniciar el servicio.
- **Implementado:** cambio de PIN protegido por el PIN vigente y bloqueo temporal despues de cinco intentos fallidos.
- **Implementado:** vinculacion bilateral con codigo de un solo uso, consentimiento versionado y revocacion por cualquiera de las dos personas.
- **Implementado:** personalizacion local de mensaje, referencia e imagen con vista previa, almacenamiento privado y fallback nativo.
- **Implementado:** umbral administrado por el guardian, alerta generica, ventana de 30 minutos, cooldown de seis horas solo tras entrega y reintento seguro si falla la red.
- **Pendiente para GO:** prueba manual en Pixel 9 y un segundo Android. Hasta aprobarla, `1.3.6` es candidata interna y no checkpoint de produccion.

## Fase 2 - Seguridad De Auth Y Comunidad

Duracion estimada: 1 semana.

### Trabajo

- Probar ingreso, registro, confirmacion, recuperacion y reintentos con Turnstile en Android.
- Activar Bot and Abuse Protection en Supabase solo despues de aprobar el APK compatible.
- Implementar `minimum_supported_version` para rechazar clientes antiguos con mensaje de actualizacion.
- Exigir MFA TOTP para moderadores y administradores.
- Ejecutar simulacro de moderacion con casos P0, P1 y P2.
- Confirmar quotas, RLS, borrado de cuenta y revocacion de sesion.
- Definir retencion y purga de evidencia de moderacion.

### Criterio De Terminado

- Auth no puede saltarse CAPTCHA desde una version vieja.
- Un usuario no puede leer ni modificar datos de otra cuenta.
- La eliminacion borra cuenta y datos asociados segun la politica.
- La moderacion deja auditoria, respeta roles y no expone al reportante.
- Todos los scripts de seguridad remota aprueban.

### Estado De Implementacion - 2026-07-18

- **Implementado:** `VersionGateProvider` en la raiz de la app, con bloqueo duro para APKs por debajo del minimo soportado.
- **Implementado:** tabla `public.runtime_gates` con RLS y lectura publica controlada para `anon` y `authenticated`.
- **Implementado:** migracion `20260717111000_runtime_version_gate.sql` aplicada al proyecto Supabase real.
- **Implementado:** verificacion automatica `npm run test:runtime-gate`.
- **Sigue pendiente:** activar Turnstile extremo a extremo en Supabase y resolver la advertencia de leaked password protection antes de beta externa.

### Puerta GO/NO-GO Fase 2

`test:auth:readiness`, `test:auth:surfaces`, `test:supabase:security` y `test:supabase:negative` deben aprobar, junto con prueba manual Android y simulacro de moderacion.

## Fase 3 - Legal, Privacidad Y Google Play

Duracion estimada: 1 a 2 semanas, en paralelo con asesoria legal.

### Trabajo Legal

- Definir responsable legal, pais, jurisdiccion, edad minima y correo de privacidad.
- Aprobar Politica de Privacidad, Terminos y Community Guidelines.
- Publicar esas paginas en `clean4jesus.com`.
- Crear pagina web para solicitar eliminacion de cuenta y datos.
- Versionar consentimiento y conservar evidencia de aceptacion.
- Cerrar protocolo de crisis y aclarar que la app no es servicio de emergencia.

### Trabajo Google Play

- Abrir y verificar Play Console.
- Completar Data Safety con datos locales, Supabase, SMTP y Turnstile.
- Completar formulario de uso de AccessibilityService.
- Completar declaracion de `VpnService` y explicar su funcion principal de proteccion.
- Crear aviso destacado y consentimiento dentro de la app antes de activar cada permiso sensible.
- Preparar video de demostracion si Play lo solicita para permisos sensibles.
- Verificar el `targetSdkVersion` exigido al momento de subir; actualmente una nueva app debe apuntar al menos a API 35.

### Criterio De Terminado

- Lo declarado en Play coincide exactamente con el comportamiento del APK.
- La app explica por que usa Accesibilidad/VPN antes de abrir Ajustes.
- Existe eliminacion dentro de la app y una URL publica para solicitarla.
- Ningun texto promete bloqueo perfecto ni acceso a datos que la app no usa.

## Fase 4 - Localizacion ES / EN / FR / PT-BR

Estado tecnico: implementada. Revision humana y QA multidispositivo pendientes.

### Orden De Migracion

1. Ajustes y Auth.
2. Comunidad.
3. Palabra y planes.
4. Refugio al final, con regresion nativa completa.
5. Notificaciones, correos, textos legales y ficha de Play Store.

### Trabajo

- Mover todo texto visible al catalogo `i18n`.
- Persistir idioma y usar idioma del sistema como primera sugerencia.
- Traducir fechas, plurales, validaciones, notificaciones y recursos nativos Android.
- Revisar traduccion pastoral y teologica con una persona humana.
- Probar textos largos en frances sin truncamiento.
- Traducir correos de Auth y paginas legales.

### Criterio De Terminado

- No quedan textos de producto hardcodeados en pantallas migradas.
- Cambiar idioma no requiere reinstalar ni cerrar sesion.
- ES, EN, FR y PT-BR completan los mismos recorridos.
- No hay botones cortados, textos superpuestos ni footer comprimido.

## Fase 5 - Producto Y Diferenciadores

Duracion estimada: 1 semana. Se ejecuta solo despues de P0.

### 5.1 Notificaciones Reales

- Recordatorio diario del plan activo.
- Notificacion al retomar una lectura pendiente.
- Preferencias de horario, silencio y desactivacion.
- Navegacion correcta al tocar la notificacion.

### 5.2 Modo Oscuro

- Tokens semanticos de color, no estilos duplicados por pantalla.
- Respeto por configuracion del sistema y selector manual.
- Regresion visual completa en ES/EN/FR.

### 5.3 Widget Android

- Primera version: lectura de hoy, progreso del plan y CTA para abrir Palabra.
- Sin datos sensibles ni contenido comunitario en pantalla bloqueada.

### 5.4 Recurso Cristiano Semanal

- Cancion, sermon o lectura curada editorialmente.
- Enlace externo seguro y atribucion correcta.
- No construir algoritmo de recomendaciones en la primera beta.

### 5.5 Limites De Apps

- Decidir si el contador aproximado actual se mantiene con disclosure o se migra a `UsageStatsManager`.
- Si no alcanza precision aceptable, retirar el contador de la beta antes que prometer datos incorrectos.

## Fase 6 - Calidad, Release Y Multi-Dispositivo

Duracion estimada: 1 semana.

### Automatizacion Obligatoria

- TypeScript.
- Unitarias.
- E2E.
- Export web.
- Pruebas de seguridad Supabase.
- Android lint y pruebas nativas del servicio.
- Escaneo de dependencias y secretos.
- Verificacion automatica de version, `versionCode` y artefacto.

### Matriz Android Minima

- Pixel 9: dispositivo principal.
- Samsung gama media.
- Motorola o Xiaomi.
- Pantalla pequeña y pantalla grande.
- Android minimo soportado, Android actual y una version intermedia.
- Wi-Fi, datos moviles, modo avion y reconexion.
- Reinicio del dispositivo, ahorro de bateria y app en segundo plano.

### Observabilidad

- Crash reporting sin capturar correo, contenido bloqueado ni mensajes.
- Metricas minimas: activacion del Refugio, finalizacion de onboarding, lecturas y errores tecnicos.
- Nada de historial de navegacion, terminos detectados o contenido comunitario en analitica.

### Criterios De Candidata Beta

- Cero bugs P0 y P1 abiertos.
- Flujo principal aprobado en todos los dispositivos de la matriz.
- Sesiones sin crash >= 99.5% durante pruebas internas.
- Registro, bloqueo, Palabra, Comunidad y eliminacion aprobados de extremo a extremo.

## Fase 7 - Beta Cerrada Y Publicacion

Duracion estimada: 3 a 4 semanas.

### Preparacion De Play Store

- AAB de produccion firmado con Play App Signing.
- Nombre, descripcion corta/larga y categoria.
- Icono, feature graphic y capturas ES/EN/FR.
- Clasificacion de contenido.
- Data Safety y declaraciones de permisos aprobadas.
- Email y URL de soporte.
- Politica de Privacidad y eliminacion publicas.

### Prueba Interna

- Equipo y amigos cercanos.
- Validar instalacion desde Play, actualizaciones y deep links.
- Recoger bugs mediante un formulario unico.

### Prueba Cerrada

- Si la cuenta personal fue creada despues del 13 de noviembre de 2023: minimo 12 testers inscritos durante 14 dias continuos.
- Incluir diferentes marcas, tamaños y versiones Android.
- Medir activacion, bloqueos falsos, crashes, registro, retencion de planes y seguridad percibida.

### Produccion

- Corregir hallazgos de beta.
- Solicitar acceso a produccion.
- Lanzamiento gradual, no 100% el primer dia.
- Monitorear crashes, Auth, moderacion y soporte diariamente durante la primera semana.

## Metricas De Exito

### Calidad

- Sesiones sin crash >= 99.5% en beta y objetivo >= 99.8% en produccion.
- Cero incidentes de exposicion de datos.
- Cero falsos positivos confirmados en banca y YouTube dentro de la matriz.

### Producto

- >= 80% completa activacion de Refugio.
- >= 60% completa el primer devocional.
- >= 40% inicia un plan en los primeros siete dias.
- >= 25% participa o reacciona en Comunidad durante la primera semana.

### Operacion

- Reportes P0 atendidos inmediatamente.
- Reportes P1 contenidos el mismo dia.
- Solicitudes de privacidad y eliminacion trazables.

## Cadencia De Trabajo

Cada bloque se ejecuta asi:

1. Leer directivas y checkpoint.
2. Escribir criterios de aceptacion y pruebas.
3. Implementar el cambio mas pequeño posible.
4. Ejecutar QA automatizada y adversarial.
5. Revisar en Android real.
6. Versionar y actualizar historial.
7. Declarar checkpoint solo despues de aprobacion del producto.

No se genera APK por cada ajuste menor. Se genera al cerrar un bloque funcional y superar su puerta de calidad.

## Secuencia Inmediata

El siguiente trabajo debe realizarse en este orden:

1. Auditar y reparar el desbloqueo temporal de 15 minutos.
2. Diseñar el contrato de persona de confianza y consentimiento.
3. Implementar personalizacion local de la pantalla de bloqueo.
4. Probar Turnstile en Android y crear version gate.
5. Cerrar documentos legales y declaraciones de permisos.
6. Migrar Ajustes/Auth a ES/EN/FR y continuar modulo por modulo.

La primera tarea concreta de la siguiente iteracion es **PIN de interrupcion funcional**, sin tocar la deteccion, VPN, exclusiones de banca/YouTube, Palabra, Comunidad ni footer.

## Sesion 2026-07-20 - Cierre Ejecutivo

- Se valido el modo oscuro en Android y queda como checkpoint de producto.
- Se valido la personalizacion local de la pantalla de interrupcion y queda congelada.
- Se valido el acceso de Comunidad con Google; el flujo queda congelado. El branding del consentimiento OAuth se gestiona fuera de la app, en Google Auth Platform/Supabase.

### Siguiente Sesion

1. Auditar el PIN de falso positivo y la ventana temporal de 20 segundos en Android real.
2. Validar el flujo de persona de confianza en un segundo dispositivo, sin modificar los checkpoints aprobados.
3. Preparar la matriz de idiomas ES/EN/FR y priorizar la primera migracion de textos.
4. Completar privacidad, permisos y declaraciones para beta cerrada.
5. Repetir QA adversarial, pruebas E2E y prueba en varios anchos Android antes del siguiente APK.

## Sesion 2026-07-21 - Internacionalizacion Global En Progreso

- Se incorporo una base unica para ES, EN y FR y se migraron las superficies principales de Refugio, Palabra, Comunidad, Mi perfil, ajustes y legales.
- Se localizaron los metadatos del catalogo de planes y se corrigio la reparacion de acentos heredados para evitar textos como `ProtecciÃ³n` o `CommunautÃ©` en pantalla.
- La validacion automatizada queda en verde: TypeScript sin errores y 117 pruebas unitarias aprobadas.
- Se añadió portugués (`pt`) a la preferencia persistente, ajustes, textos legales, navegación y superficies principales.

### Pendiente antes del checkpoint de idiomas

1. Traducir y revisar los 56 dias de planes y los 7 devocionales diarios.
2. Migrar mensajes secundarios de permisos, PIN, bloqueo de apps, persona de confianza y alertas dinamicas.
3. Ejecutar QA manual en ES/EN/FR y solo despues preparar el APK de prueba.

## Sesion 2026-07-21 - Catalogo Editorial Escalable

- Se desplegaron en Supabase las tablas normalizadas de planes, traducciones, dias y traducciones diarias, con RLS y acceso directo revocado.
- Los 8 planes actuales, 56 dias y 224 lecturas localizadas ES/EN/FR/PT quedaron publicados y verificados mediante una RPC segura y acotada.
- La app usa ahora catalogo remoto validado, cache por idioma y respaldo local offline; inscripciones y progreso personal permanecen privados en el dispositivo.
- El pipeline editorial impide sobrescribir migraciones aplicadas y exige una nueva version de contenido para cada publicacion.

### Siguiente bloque de escalado

1. ~~Migrar el devocional diario al catalogo remoto.~~ Completado el 21 de julio de 2026.
2. ~~Separar listado y detalle de planes para descarga bajo demanda.~~ Completado el 21 de julio de 2026.
3. Agregar paginacion incremental y estados de sincronizacion.
4. Diseñar el panel editorial con revision humana antes de publicar.

## Sesion 2026-07-21 - Devocional Diario Escalable

- Se desplegaron en Supabase el catalogo diario, sus traducciones ES/EN/FR/PT, RLS y una RPC publica de solo lectura.
- Los 7 devocionales y sus 28 traducciones quedaron publicados sin exponer tablas ni credenciales editoriales al cliente.
- La app selecciona por fecha local, valida la respuesta, guarda cache diario por idioma y mantiene un respaldo minimo sin conexion.
- La UI de Palabra, Planes, el footer y el Refugio no cambiaron.
- QA aprobado: TypeScript, 140 unit tests, 16 recorridos E2E y exportaciones Android/web.

### Siguiente bloque recomendado

1. ~~Dividir catalogo y detalle de planes para descargar lecturas solo al abrir un plan.~~ Completado el 21 de julio de 2026.
2. ~~Reemplazar el respaldo completo de ocho planes por un catalogo offline minimo.~~ Completado el 21 de julio de 2026.
3. Crear calendario editorial y panel de revision/publicacion con roles.
4. Medir AAB de release, latencia, cache y comportamiento offline en Android real.

## Sesion 2026-07-21 - Planes Bajo Demanda

- El catalogo y los cuerpos completos quedaron separados mediante dos RPC publicas de solo lectura y tablas editoriales protegidas.
- Palabra descarga unicamente el plan que el usuario abre y lo guarda localmente para posteriores lecturas sin conexion.
- Las fuentes completas siguen en el repositorio como material editorial para publicar migraciones, pero ya no son importadas por el runtime movil.
- QA aprobado: TypeScript, 142 pruebas unitarias, 16 recorridos E2E y contrato remoto de Supabase.
- El bundle Android bajo de 6.795.138 a 6.283.328 bytes; el APK debug de 216 MB sigue incluyendo Expo Dev Client y no representa el tamano de Play Store.

## Sesion 2026-07-21 - Cierre Ejecutivo Y Ruta Multiplataforma

### Checkpoint Actual

- Refugio, seguridad, Palabra, Comunidad, Google Auth, modo oscuro e idiomas ES/EN/FR/PT-BR quedan como base funcional aprobada; no se modifican fuera de cambios expresamente relacionados y con regresion completa.
- Se genero un AAB ARM64 optimizado de medicion de **34.07 MB** (`32.49 MiB`). El payload comprimido de `base` es aproximadamente `22.69 MiB`; Play Console debe confirmar la descarga final por dispositivo.
- El AAB de medicion usa firma debug y **no se sube a Google Play**. Antes de cualquier track de Play se requiere firma release y Play App Signing.

### Producto Aprobado Antes De Beta

1. **Rescate de 60 segundos:** interrupcion breve con respiracion, verdad biblica, accion concreta y opcion de contactar a la persona de confianza.
2. **Falsos positivos privados:** permitir reportar un error sin subir texto visible, URL, mensajes ni historial; las mejoras globales pasan por revision humana.
3. **Resumen semanal:** progreso, planes, decisiones y acompanamiento; nunca historial de navegacion ni contenido detectado.
4. **Widgets Android/iOS:** plan o lectura actual y CTA seguro, sin datos sensibles en la pantalla bloqueada.

### Ruta iOS Obligatoria

1. Auditar viabilidad y politicas de Apple para Family Controls, Managed Settings, Device Activity y Network Extension.
2. Definir arquitectura iOS nativa con paridad de resultado respecto a Android, documentando cualquier limite que Apple no permita replicar.
3. Implementar onboarding, permisos, proteccion, interrupcion permitida, Palabra, Comunidad, Auth, idiomas, modo oscuro, notificaciones y widgets.
4. Ejecutar QA en varios iPhone, versiones de iOS, redes, reinicios, ahorro de bateria y escenarios de bloqueo.
5. Preparar Apple Developer, firma, App Store Connect, privacidad, capturas, declaraciones, videos y revision de permisos/capabilities.

### Puertas Comunes De Produccion

1. Android: firma release, Play App Signing, DNS cifrado DoH/DoT, declaraciones de VPN/Accesibilidad y matriz multidispositivo.
2. iOS: capabilities aprobadas, firma y provisioning de produccion, revision de privacidad y validacion en dispositivos reales.
3. Legal: Politica de Privacidad, Terminos, Normas de Comunidad, eliminacion de cuenta/datos, soporte y protocolo de crisis publicados en `clean4jesus.com`.
4. Operacion: moderacion, alertas, observabilidad privada, soporte, respuesta a incidentes y consentimiento versionado.
5. Tiendas: fichas localizadas, capturas, videos requeridos, clasificacion, Data Safety/App Privacy y beta cerrada antes del lanzamiento gradual.

### Orden Recomendado De La Proxima Sesion

1. Disenar e implementar el Rescate de 60 segundos sin alterar el motor de bloqueo aprobado.
2. Definir el contrato privado de reporte de falsos positivos y sus pruebas de privacidad.
3. Disenar el resumen semanal y decidir que metricas locales puede usar sin exponer actividad sensible.
4. Abrir el ADR de arquitectura iOS y confirmar capacidades reales antes de escribir el modulo nativo.
5. Iniciar el sprint de admision a tiendas: firma release, DoH/DoT y paginas legales publicas.

### Decision Ejecutiva

- La beta publica sera multiplataforma como objetivo de negocio, pero Android e iOS no compartiran necesariamente el mismo mecanismo de proteccion nativa.
- No se iniciara publicidad pagada hasta completar una beta cerrada, resolver P0/P1 y confirmar el comportamiento de permisos en ambas plataformas.
- Primero se valida con un grupo controlado; despues se hace lanzamiento gradual y adquisicion de usuarios.

## Sesion 2026-07-23 - Rescate De 60 Segundos

- Se implemento en la actividad nativa de interrupcion una accion opcional de rescate que conserva el bloqueo aprobado y no toca VPN, Accesibilidad, PIN ni falsos positivos.
- El rescate muestra una pausa guiada de 60 segundos con cinco ciclos de respiracion 4-2-6, cuenta regresiva y estados Inhala, Sosten y Exhala en la pantalla que ya protege el dispositivo.
- Al terminar, la actividad confirma que el Refugio sigue activo y devuelve a la pantalla de bloqueo; no abre la app protegida, no crea una ventana de desbloqueo y no envia ni guarda contenido sensible.
- QA tecnico: `:app:compileDebugKotlin` paso con `BUILD SUCCESSFUL`; falta validar el recorrido en Pixel 9 y otro Android antes de declarar checkpoint o generar APK.

### Siguiente Validacion

1. Abrir Chrome o una red social protegida y provocar un bloqueo.
2. Tocar `Rescate de 60 segundos` y comprobar que la respiracion cambia Inhala, Sosten y Exhala durante un minuto.
3. Confirmar que durante y despues del rescate la app original sigue bloqueada y que VPN, Accesibilidad, PIN y falso positivo mantienen su comportamiento anterior.
4. Repetir con idioma ES, EN, FR y PT y revisar contraste, tamano y recorte en Pixel 9.

### Revision De Producto - 23 De Julio

- Elena Rios, Product Lead, detecto que el rescate funcionaba pero tenia poca jerarquia: parecia un boton secundario dentro de una pantalla ya cargada.
- Se rediseño solo la presentacion del rescate: CTA "Respirar 60 segundos", tarjeta calida independiente, explicacion de que no desbloquea y gradiente sutil en la pantalla de respiracion.
- El motor de bloqueo, VPN, Accesibilidad, PIN, falso positivo y retorno a la pantalla de interrupcion no fueron modificados.
- QA tecnico: `:app:compileDebugKotlin` paso despues del cambio; falta preview Android y validacion manual antes de otro APK.

## Consejo De Producto Y Release - 23 De Julio

- Sofía Beltrán, Product Designer: aprobó una pantalla más emocional y dinámica, con la foto personalizada preservada, jerarquía clara entre motivo, rescate y salida, y un halo de respiración sutil que no compite con el bloqueo.
- Valentina Cruz, Software Architect: aprobó mantener el alcance dentro de `InterruptionActivity.kt`; no se modifican VPN, Accesibilidad, PIN, cierre de app ni contratos del motor nativo.
- Mateo Vidal, Engineering & QA Lead: confirmó que el compile Kotlin pasó; exige validar en Pixel 9 el bloqueo, la respiración completa, el retorno sin bypass, foto personalizada y los cuatro idiomas antes de construir.
- Samuel Ortega, Tech Lead: veredicto `NO-GO` para APK por ahora. Autorizará el build después del preview móvil aprobado y de la matriz manual de regresión.

### Cambio Tecnico Aplicado

- El ciclo 4-2-6 ahora anima también un halo de baja intensidad alrededor del contador, sincronizado con inhalación y exhalación.
- El halo se reinicia al finalizar y no altera duración, permisos, bloqueo, VPN, Accesibilidad, PIN ni retorno a la pantalla de interrupción.

## Checkpoint Aprobado - 1.3.13 - 23 De Julio

- La pantalla de interrupción quedó aprobada con dos acciones principales: `Respirar 60 segundos` y `Cerrar`.
- `¿Fue un error?` ya no compite como botón; es un enlace textual que revela el flujo de PIN.
- El APK debug local se generó correctamente y quedó en `artifacts/apk/current/Clean4Jesus-current.apk`.
- El siguiente punto es validar en el Pixel 9 el recorrido completo y después continuar con la siguiente prioridad del roadmap, sin modificar este checkpoint.

## Sesion 2026-07-21 - Consejo Ejecutivo Persistente

- Se creo y valido `clean4jesus-executive-team`, un skill persistente con trece roles especializados y carga progresiva para futuras sesiones.
- El consejo incluye Producto, Ingenieria/QA, Arquitectura, Tech Lead, Seguridad/Privacidad, Editorial/Teologia, Trust & Safety, Soporte, Growth, Operaciones, Legal/Finanzas, Asesoria Legal y Diseno.
- La matriz de gobierno define convocatorias minimas, severidades P0-P3, autoridad de `NO-GO`, registro de disensos y acciones que requieren autorizacion del CEO.
- El consejo no corre en segundo plano: se convoca bajo demanda y solo con los roles necesarios para mantener eficiencia.
- Los trece roles recibieron nombres, personalidades y preguntas criticas persistentes en `references/personas.md`; estas identidades no representan personas reales ni acreditaciones humanas.
- Se creo el directorio presentable `docs/EQUIPO-VIRTUAL-CLEAN4JESUS.pdf`, junto con su fuente HTML y una ilustracion editorial de la junta.

## Sesion 2026-07-23 - Falsos Positivos En Supabase

- Se desplego `public.false_positive_reports` con RLS y sin permisos directos para clientes anonimos o autenticados.
- Se desplego la Edge Function `report-false-positive` con validacion estricta, limite por instalacion y almacenamiento minimo.
- El cliente Android reporta solo despues del PIN correcto; no se modifica el bloqueo ni se envia contenido sensible. Falta probar el recorrido real en Pixel 9 y construir el siguiente APK solo despues de esa evidencia.

## Sesion 2026-07-23 - Revision Humana De Falsos Positivos

- Se agrego una cola privada y agrupada para casos de falso positivo; conserva solo paquete, huella tecnica, idioma, conteo y marcas de tiempo.
- Irene Salazar y Alma Torres definieron control por MFA, motivo obligatorio, auditoria inmutable y prohibicion de cambios automaticos de reglas.
- La migracion y Edge Function ya estan desplegadas y validadas con una senal sintetica eliminada despues de la prueba. El frontend de la consola compila; queda pendiente publicar ese frontend cuando Cloudflare CLI vuelva a autenticar correctamente.

## Checkpoint Operativo - Consola De Falsos Positivos - 23 De Julio

- La consola interna de moderacion quedo publicada y accesible en `moderation.clean4jesus.com`.
- Inicio de sesion y recuperacion de contrasena exigen el mismo CAPTCHA de Cloudflare configurado para Supabase; no se desactiva CAPTCHA para resolver errores de autenticacion.
- El enrolamiento MFA TOTP ya funciona para administradores. Si un enrolamiento anterior quedo incompleto, la consola elimina solo ese factor incompleto con el nombre `Consola Clean4Jesus` antes de crear uno nuevo; nunca elimina factores verificados ni ajenos.
- El flujo fue comprobado manualmente: recuperacion de contrasena, ingreso y configuracion MFA. La revision humana sigue sin modificar reglas, allowlists o telefonos automaticamente.

## Decisiones Legales Iniciales - 23 De Julio

- Responsable inicial: Emmanuel Lopez, persona natural.
- Pais de operacion inicial: Colombia. La vision de producto es internacional y la app ya soporta espanol, ingles, frances y portugues, pero cada expansion territorial requerira revision legal y operativa.
- Contacto publico previsto: `soporte@clean4jesus.com`. Antes de publicar debe existir un buzon real, atendido y con un canal equivalente para solicitudes de privacidad.
- Edad: el producto aspira a ayudar a toda persona, pero la beta no declarara todavia una audiencia infantil. Comunidad incluye contenido generado por usuarios y conversaciones sobre un tema sensible; permitir menores exige pantalla de edad, controles reforzados, moderacion y revision juridica especifica. La decision de edad publica permanece abierta hasta completar ese diseno.

## Cierre De Sesion - 23 De Julio De 2026

- Se confirmo el backup remoto oficial del proyecto en GitHub privado, con `main` sincronizada y una regla permanente de commits fechados por cambio relevante.
- Se limpiaron temporales de validacion sin tocar codigo, documentos, checkpoints ni APKs vigentes.
- Proximo gran frente: Clean4Jesus para iOS de extremo a extremo, precedido por una auditoria de arquitectura y capacidades nativas para definir la paridad real con Android.

## Inicio De Migracion iOS - 25 De Julio De 2026

- Valentina Cruz, Samuel Ortega y Mateo Vidal aprobaron una migracion por capacidades: Android conserva su motor nativo; iOS no simula Accesibilidad, cierre de apps ni estado de proteccion.
- Se creo la frontera multiplataforma, la ruta honesta de preparacion iOS, perfiles EAS para simulador/preview/produccion y contratos de prueba para impedir que iOS marque el Refugio como activo sin evidencia nativa.
- QA de base aprobado: TypeScript, 150 pruebas unitarias, configuracion Expo iOS y exportacion del bundle iOS. No se genero release: faltan Apple Developer Program, entitlement Family Controls, extensiones Swift, iPhone fisico y TestFlight.
- Siguiente hito: activar firma Apple y solicitar Family Controls; despues implementar Device Activity, Managed Settings, Shield Configuration y Shield Action con pruebas en dispositivo real.

## Landing Oficial Y Growth Responsable - 25 De Julio De 2026

- Se preparo la landing estatica oficial para `clean4jesus.com`, independiente de los modulos moviles aprobados y lista para despliegue manual en Cloudflare.
- El mensaje publico se apoya en Refugio, Palabra y Comunidad, con accesibilidad, version movil y movimiento reducido respetado.
- Las estadisticas publicas usan fuentes regulatorias y revision academica; el copy separa asociacion de causalidad y no promete cura, diagnostico ni bloqueo perfecto.
- El QR de descarga queda bloqueado de forma intencional hasta tener URLs reales de beta o tiendas; el CTA actual permite solicitar acceso beta mediante el correo publico.

### Evidencia Editorial Responsable - 25 De Julio De 2026

- Se incorpora Daniela Pardo como Research & Evidence Lead y se registra el protocolo de fuentes, límites y revisión humana para cualquier copy público sensible.
- La landing añade una experiencia visual de investigación que diferencia exposición, uso problemático, procesos asociados, bienestar y prevención de menores sin usar diagnósticos ni causalidad falsa.

## Preparacion iOS Sin Membresia - 25 De Julio De 2026

- Se agrego un manifiesto de readiness y una comprobacion automatica: `npm run test:ios:readiness` separa la base tecnica ya lista de los requisitos que solo puede activar el titular de Apple Developer.
- Se documento el handoff `docs/IOS-APPLE-HANDOFF.md`: App Store Connect, Family Controls, App Group, APNs, OAuth iOS, extensiones Swift y TestFlight se activaran cuando exista la membresia y un Mac con Xcode.
- El equipo puede continuar ahora con la interfaz compartida, i18n, Supabase, contenido, legal, QA y metadata. La proteccion nativa iOS queda deliberadamente pendiente y nunca se presentara como activa sin evidencia de un iPhone real.
