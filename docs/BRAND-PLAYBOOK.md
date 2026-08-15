# Playbook de identidad de Clean4Jesus

Estado: fuente de verdad para producto, iOS, Android, web y materiales de soporte. Toda excepción requiere aprobación explícita de Producto y Diseño.

## Esencia

Clean4Jesus acompaña decisiones de protección digital con una identidad cristiana, cálida y firme. Debe comunicar refugio, claridad y dignidad; nunca miedo, vergüenza, vigilancia invasiva ni estética genérica de “app blocker”.

La promesa visual es: **un refugio claro, no un castigo**.

## Marca y logo

La marca oficial es el escudo abierto con cruz blanca sobre azul marino. Sus activos aprobados son:

| Uso | Activo | Regla |
| --- | --- | --- |
| Icono principal iOS/Android | `assets/icon.png` | No redibujar, recortar ni sustituir. |
| Marca transparente en fondos de producto | `assets/android-icon-foreground.png` | Usar sobre azul marino oficial. |
| Icono adaptativo Android | `assets/android-icon-background.png` + `assets/android-icon-foreground.png` | Mantener como pareja. |
| Wordmark legal/público | `Clean4Jesus` | `Clean` y `Jesus` azules; `4` blanco con contorno azul. |

No usar círculos dorados detrás del escudo, relojes de arena, símbolos genéricos de pausa ni variantes improvisadas del logo. El escudo no se distorsiona, no recibe sombra ornamental y debe conservar área libre alrededor.

## Color

| Token | Valor | Uso autorizado |
| --- | --- | --- |
| `brand.navy` | `#071F52` | Fondo de marca, Shield iOS, iconografía principal y superficies de confianza. |
| `product.primary` | `#1A237E` | Acciones principales en modo claro. |
| `product.primary-dark` | `#0F164E` | Texto o bordes de alta jerarquía. |
| `brand.gold` | `#F9A825` | Acento pequeño, progreso, énfasis o detalle; nunca como fondo dominante del Shield. |
| `brand.gold-dark` | `#F6C652` | Acento en modo oscuro. |
| `neutral.white` | `#FFFFFF` | Logo, texto sobre navy y CTA de alto contraste. |
| `neutral.ink` | `#17211D` | Texto principal en modo claro. |
| `neutral.mist` | `#F8F9FA` | Fondo claro. |
| `neutral.night` | `#10131B` | Fondo oscuro de la app. |

El azul marino domina; el blanco aporta claridad; el dorado guía la atención. El dorado no debe competir con el mensaje ni ocupar grandes áreas funcionales.

## Tipografía

| Rol | Familia | Uso |
| --- | --- | --- |
| Display | Lexend Deca Bold | Titulares Android y piezas de marca. |
| Heading | Plus Jakarta Sans SemiBold | Títulos de sección, botones y jerarquía funcional. |
| Body | Inter Regular | Lectura, ayuda, formularios y texto largo. |
| iOS nativo / extensiones Apple | San Francisco del sistema | Shield, selector y superficies que Apple controla. |

Las extensiones Screen Time de Apple no aceptan la tipografía personalizada de la app. En el Shield se conserva la identidad con logo, color, tono y jerarquía; la fuente es la del sistema por restricción de Apple, no una excepción de marca.

## Sistema de interfaz

- Radio predominante: 16–24 pt; botones táctiles con mínimo 44 pt.
- Fondo dominante limpio; una acción primaria clara por pantalla crítica.
- Títulos breves, directos y humanos. Ejemplo: “Tu límite de hoy se cumplió”.
- El copy habla de acompañamiento: “Tu refugio permanece activo”; nunca culpa o diagnostica.
- Estados de éxito: verde funcional. Riesgo/error: rojo funcional. Ninguno sustituye al azul marino como identidad.

## Perfil obligatorio del Shield iOS

- Fondo: `brand.navy`.
- Icono: `Clean4JesusOfficialMark`, cargado desde el activo oficial dentro del bundle de la extensión.
- Título: blanco; subtítulo: blanco suave.
- CTA único: fondo blanco y texto navy.
- Acento dorado: solo en la marca, no en botón ni círculo de fondo.
- Sin botón de rescate, cronómetro, PIN, contador o navegación ficticia.

Apple limita esta pantalla a icono, colores, título, subtítulo y botones. No se simulan componentes que el sistema no permite.

## Aplicación por plataforma

- Android conserva su interrupción personalizada aprobada y usa los tokens del tema compartido.
- iOS usa el mismo logo, paleta, tono y jerarquía, adaptados a Family Controls y Managed Settings.
- Web y legal mantienen azul marino, blanco y dorado; Lexend para titulares e Inter para lectura.
- Todo texto visible debe estar localizado y respetar el idioma del dispositivo o la preferencia explícita.

## Gobierno de marca

Antes de cambiar logo, color, tipografía, Shield, splash, navegación o pantallas de interrupción:

1. Actualizar este playbook y el token correspondiente.
2. Probar contraste, modo claro/oscuro, tamaño de texto y VoiceOver/TalkBack.
3. Validar en iPhone y Android reales cuando el cambio llegue a una superficie nativa.
4. Adjuntar captura real al PR; no usar mockups como evidencia de implementación.
