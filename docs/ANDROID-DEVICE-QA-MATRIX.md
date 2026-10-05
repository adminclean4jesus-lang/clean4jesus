# Matriz de QA físico Android — beta cerrada

- **Actualizada:** 2026-10-04
- **Candidata inicial:** `1.3.53 (66)` — APK standalone local
- **Objetivo:** verificar en teléfonos reales que Clean4Jesus abre, conserva un estado honesto de protección, bloquea navegación adulta mediante VPN local e interrupción, y mantiene compatibilidad con apps financieras.
- **Regla de evidencia:** registrar modelo, Android/One UI/MIUI, operador o red, build, fecha, pasos, resultado y captura o video corto. Nunca adjuntar PIN, token, correo completo, saldos, número de cuenta, URL sensible ni contenido adulto.

## Preflight de cada sesión

1. Instalar solamente [la APK standalone actual](/C:/Users/millo/Desktop/Clean4Jesus/artifacts/apk/current/Clean4Jesus-current.apk). No usar Expo Go, Metro ni QR.
2. Confirmar en **Ajustes > Apps** que la versión instalada coincide con el registro de la sesión.
3. Crear un usuario QA o usar una cuenta consentida. La prueba bancaria se hace solo con una sesión propia: no realizar transferencias, pagos ni capturar información financiera.
4. Anotar el estado inicial: PIN, VPN, Accesibilidad, conectividad y optimización de batería.
5. Cada fallo debe incluir ID de caso, severidad, pasos mínimos para reproducir y evidencia sanitizada.

## Cobertura mínima antes de beta externa

| Perfil | Dispositivo real mínimo | Android | Riesgo que cubre | Estado |
| --- | --- | --- | --- | --- |
| Referencia | Pixel 8/9 o equivalente | 14/15/16 | Android limpio, permisos, splash, VPN y Accesibilidad | Pendiente |
| Samsung | Galaxy A/S reciente | 13–15, One UI | batería adaptativa, navegación, permisos Samsung | Pendiente |
| OEM agresivo | Motorola, Xiaomi/Redmi o Realme | 12–15 | cierre de servicios en segundo plano y variantes de Ajustes | Pendiente |
| Pantalla pequeña | Android de 6.1” o menor | 12+ | texto, botones, scroll y pantalla de interrupción | Pendiente |

No se abre beta externa con solo el Pixel. Se exige al menos un resultado aprobado en dos fabricantes distintos; Samsung o un OEM con gestión agresiva de batería es obligatorio.

## Criterio de salida

| Resultado | Regla |
| --- | --- |
| **P0 / NO-GO** | crash, bucle de navegación, falsa protección activa, VPN no bloquea cuando afirma estar activa, PIN expuesto, bloqueo de Nu/u otra financiera o interrupción que no funciona en el flujo probado. |
| **P1 / No distribuir nueva cohorte** | onboarding bloqueado, estado que no se actualiza al volver de Ajustes, pérdida de configuración tras reinicio o UI que oculta un requisito crítico. |
| **P2 / Puede entrar en backlog beta** | detalle visual, copy menor o problema aislado sin impacto en protección ni comprensión del estado. |
| **GO Android** | cero P0/P1 abiertos, casos críticos aprobados en dos OEM, evidencia conservada y APK firmada para el canal de distribución elegido. |

## Casos críticos: ejecutar en cada dispositivo

| ID | Escenario y pasos | Resultado esperado | Evidencia |
| --- | --- | --- | --- |
| A-01 | Abrir desde instalación nueva 20 veces en frío y 10 en caliente. | Sin crash, pantalla blanca ni splash genérico; aparece el emblema oficial sobre azul marino y llega al flujo correcto. | Video de dos aperturas + conteo. |
| A-02 | Cerrar desde recientes, abrir de nuevo y cambiar entre Refugio, Palabra, Comunidad y Perfil. | Navegación estable; no hay pantalla congelada, mojibake ni datos sensibles visibles en recientes. | Capturas de cada tab. |
| A-03 | Iniciar sesión con Google y con correo QA válido. | Éxito no muestra un error falso; el estado persiste al reiniciar. | Captura sanitizada. |
| A-04 | Solicitar PIN de confianza, cerrar la app antes de la confirmación y volver. Repetir tras confirmación y tras vencimiento. | Se muestra estado pendiente, confirmado o vencido; nunca obliga a rehacer el flujo si ya existe un PIN vigente. | Capturas de estados, sin PIN/correo. |
| A-05 | Desinstalar, reinstalar e iniciar sesión con la misma cuenta que ya tiene PIN vigente. | Recupera el estado de PIN existente y no solicita otra persona de confianza. | Captura sanitizada. |
| P-01 | Desde onboarding, activar VPN y aceptar el diálogo del sistema. Volver a Clean4Jesus. | VPN queda activa, el paso continúa y el estado no vuelve falsamente a “Pendiente”. | Video corto. |
| P-02 | Con VPN activa, abrir un dominio de prueba adulto no gráfico aprobado por QA; repetir en Wi‑Fi y datos móviles. | Se bloquea por DNS familiar; no se muestra contenido adulto. | Captura del bloqueo, sin URL. |
| P-03 | Desactivar VPN desde Ajustes Android y volver a Refugio. | La UI refleja “VPN desactivada” y guía a reactivarla; nunca conserva 100% de cobertura. | Antes/después. |
| P-04 | Reiniciar el teléfono con VPN previamente activada; abrir Clean4Jesus. | El estado se recupera o muestra honestamente que requiere reactivación. No declara protección activa si el túnel no está activo. | Video tras reinicio. |
| P-05 | Activar modo avión 60 s, desactivarlo y probar el estado de la VPN y bloqueo. | No crash ni estado engañoso; la VPN se recupera o pide reactivación de forma clara. | Registro de red. |
| P-06 | En Wi‑Fi, datos móviles y tras cambiar de una red a otra, repetir P-02. | Sin caída del túnel ni fuga conocida de la prueba. | Resultado por red. |
| X-01 | Activar Clean4Jesus en Accesibilidad desde onboarding y volver a la app. | El estado se actualiza y entra al Refugio al tener PIN + VPN + configuración de Accesibilidad. | Video de regreso. |
| X-02 | Volver a abrir la app, rotar entre tabs y cerrar/abrir sin tocar Ajustes. | La app consulta el estado nativo al recuperar foco; no afirma que Accesibilidad esté activa si Android la apagó. | Capturas. |
| X-03 | Desactivar Clean4Jesus manualmente en Accesibilidad y volver. | Cobertura cambia de forma honesta y el CTA lleva a Ajustes de Accesibilidad. | Antes/después. |
| X-04 | Con VPN + Accesibilidad activas, usar un navegador y un fixture QA con señal controlada. | Aparece la pantalla de interrupción sin pausa de 60 s; no requiere contenido gráfico ni URL real para esta prueba. | Video de interrupción. |
| X-05 | En una interrupción, probar PIN incorrecto, PIN correcto para falso positivo y una señal distinta. | PIN incorrecto no cambia protección; el aprobado solo permite el incidente exacto y temporal, sin apagar Refugio. | Registro sin PIN. |
| X-06 | Activar una regla deliberada de bloqueo de una app, pedir desbloqueo temporal con PIN y esperar vencimiento. | Solo ese paquete queda libre durante el plazo; vence sin liberar otros paquetes ni contenido. | Cronómetro/capturas. |
| B-01 | Con Accesibilidad activa, abrir Nu desde inicio, recientes y una notificación si existe. | Nu abre sin aviso de que Clean4Jesus accede a la cuenta; Clean4Jesus no lee ni actúa dentro de Nu. VPN sigue activa. | Video sanitizado, sin saldos. |
| B-02 | Usar Nu normalmente y salir con Atrás/Recientes. | Al volver a Clean4Jesus aparece el puente “Todo listo por aquí”, no antes de usar Nu. | Video completo. |
| B-03 | Pulsar “Volver al Refugio”, elegir Clean4Jesus, activar “Usar Clean4Jesus” y regresar. | Ajustes abre; al habilitar el servicio se vuelve a Clean4Jesus y se limpia el aviso pendiente. | Video corto. |
| B-04 | Repetir B-01 a B-03 con una segunda app financiera instalada, si está disponible. | Misma compatibilidad; no falsa interrupción ni acceso a contenido financiero. | Resultado por app. |
| B-05 | Abrir/volver rápidamente de Nu tres veces. | No duplica popups, no abre Clean4Jesus encima de Nu y no entra en loop. | Video. |
| R-01 | Forzar cierre de Clean4Jesus desde Ajustes mientras VPN/Accesibilidad están activas; volver a abrir. | La aplicación no crash; el estado reflejado coincide con Android. Registrar si el sistema detiene VPN: no es aceptable mostrarla activa si no lo está. | Antes/después. |
| R-02 | Activar ahorro de batería y, en Samsung/Xiaomi/Motorola, aplicar la política de batería por defecto. Dejar 30 min en segundo plano. | La app detecta cualquier pérdida real de VPN/Accesibilidad al volver; documentar comportamiento OEM. | Modelo y política. |
| R-03 | Recibir llamada, bloquear pantalla, desbloquear y volver a la app durante el onboarding. | No pierde el paso ni muestra estado incorrecto. | Video. |
| R-04 | Cambiar idioma, tamaño de fuente grande y modo oscuro/claro si está disponible. | Botones legibles, sin solapamiento ni truncamientos críticos. | Capturas. |
| R-05 | Sin red: abrir Refugio, Palabra y el estado de protección. | La protección local y UI esencial no dependen de internet; los errores remotos son claros y recuperables. | Captura. |
| C-01 | Crear publicación, comentario, reporte y cerrar sesión con cuenta QA. | No crash, sin duplicados por doble toque y sin exponer correo/datos de otro usuario. | Capturas sanitizadas. |
| C-02 | Intentar eliminar cuenta con CAPTCHA y reautenticación según corresponda. | Flujo seguro, una sola solicitud; conservar evidencia operativa sin datos personales. | Registro QA. |

## Pruebas complementarias por dispositivo

| Área | Prueba | Resultado esperado |
| --- | --- | --- |
| Permisos | Denegar y luego permitir VPN, notificaciones y Accesibilidad. | La app explica el siguiente paso y se recupera sin cerrar. |
| Instalación | Actualizar sobre la versión anterior y hacer instalación limpia. | No crash ni pérdida inexplicable del estado remoto de PIN. |
| Rendimiento | 15 min de navegación normal con Refugio activo. | Sin sobrecalentamiento notable, ANR ni consumo anormal evidente. |
| Notificaciones | Recibir y abrir una notificación no sensible. | Ícono correcto, deep link seguro y sin contenido sensible en lock screen. |
| Navegadores | Chrome; añadir Firefox/Brave/Edge donde estén instalados. | El comportamiento declarado se mantiene en paquetes soportados; documentar cada uno. |
| YouTube y WhatsApp | Usar ambos sin opt-in de WhatsApp. | YouTube queda fuera del análisis agresivo; WhatsApp permanece excluido hasta consentimiento explícito. |
| Reglas de apps | Crear, endurecer y liberar reglas con PIN. | Endurecer no pide PIN; liberar una regla persistente sí lo exige. |

## Registro de ejecución

Copiar una fila por prueba en el informe de QA:

| Fecha | Build | Dispositivo / SO | Red | ID | Resultado | Severidad | Evidencia | Observación |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AAAA-MM-DD | 1.3.53 (66) | Pixel 9 / Android 15 | Wi‑Fi | A-01 | PASS / FAIL / BLOCKED | P0–P2 | ruta o enlace seguro | pasos y resultado |

## Protocolo al hallar un fallo

1. Detener el caso si implica datos bancarios, PIN o posible exposición de contenido sensible.
2. Registrar el ID, el dispositivo y los pasos mínimos; adjuntar solo evidencia sanitizada.
3. Clasificar P0/P1/P2 según la tabla de salida.
4. Para P0/P1, no distribuir la APK a una cohorte nueva hasta reproducir, corregir y repetir el caso en el dispositivo original y un segundo OEM.
5. Un PASS de una versión no se hereda a otra APK que modifique VPN, Accesibilidad, onboarding, PIN o el puente bancario.

## Cierre de la matriz

El responsable de QA firma el resultado Android únicamente cuando están completos todos los casos críticos A, P, X, B y R en el Pixel de referencia y un segundo OEM, sin P0/P1 abiertos. Esto habilita el siguiente gate: firma de producción, AAB y Play Console; no equivale todavía a publicar la beta externa.
