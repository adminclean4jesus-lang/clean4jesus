# PRD Clean4Jesus Next

## Problem Statement

Clean4Jesus ya tiene una base visual y funcional, pero todavia se siente como MVP. El usuario quiere convertirla en una app sobresaliente: espiritual, social, practica y personalizada. La app debe ayudar a una persona a cuidar su pureza digital, crear habitos de vida, recibir guia espiritual, compartir testimonio y sentirse acompanada por comunidad.

## Solution

Evolucionar Clean4Jesus hacia una plataforma movil con cinco pilares:

1. Escudo: proteccion digital con PIN, DNS/VPN y futuro bloqueo de apps.
2. Habitos guiados: cada habito se convierte en un mini-coach interactivo.
3. Devocional y oracion: planes biblicos, oraciones guiadas y seguimiento espiritual.
4. Comunidad: testimonios, apoyo, publicaciones y ayuda entre usuarios.
5. Cuenta/login: identidad, sincronizacion y persistencia cloud.

## User Stories

1. Como usuario, quiero iniciar sesion, para guardar mi progreso entre dispositivos.
2. Como usuario, quiero crear una cuenta, para participar en comunidad.
3. Como usuario, quiero publicar mi testimonio, para animar a otros.
4. Como usuario, quiero pedir ayuda en comunidad, para no luchar solo.
5. Como usuario, quiero responder con apoyo y oracion, para ayudar a otros.
6. Como usuario, quiero reportar contenido inapropiado, para mantener la comunidad segura.
7. Como usuario, quiero un coach de ejercicio que me haga preguntas, para recibir una rutina adecuada.
8. Como usuario, quiero elegir objetivo fisico: bajar peso, subir peso, calistenia o gimnasio, para personalizar mi plan.
9. Como usuario, quiero registrar ejercicios completados, para medir constancia.
10. Como usuario, quiero un coach de comida saludable, para estimar calorias segun mi objetivo.
11. Como usuario, quiero registrar agua tomada, para mejorar mi hidratacion.
12. Como usuario, quiero registrar horas dormidas, para entender mi descanso.
13. Como usuario, quiero un plan biblico, para leer con direccion y no al azar.
14. Como usuario, quiero oraciones guiadas, para saber como orar cuando estoy debil.
15. Como usuario, quiero que "Dia limpio" tenga reflexion y protocolo de emergencia, para responder mejor ante tentacion.
16. Como usuario, quiero ver rachas y progreso, para mantener motivacion.
17. Como usuario, quiero probar la app en mi celular, para sentir si la experiencia realmente funciona.

## MVP Propuesto Por Fases

### Fase 0: Prueba En Celular

- Hacer que Expo Go funcione en Android.
- Crear checklist manual.
- Ajustar layout para pantalla real.

### Fase 1: Login Y Base Cloud

- Supabase Auth.
- Tabla `profiles`.
- Sincronizar habitos basicos.
- Mantener modo local si no hay sesion.

### Fase 2: Comunidad

- Tab nueva `Comunidad`.
- Feed de testimonios.
- Crear publicacion.
- Responder/apoyar.
- Reportar contenido.
- RLS y moderacion basica.

### Fase 3: Habitos 2.0

- Reemplazar checklist plano por modulos:
  - Coach ejercicio
  - Coach comida
  - Plan Biblia
  - Oracion guiada
  - Dia limpio
  - Agua
  - Sueno
- Cada modulo tiene preguntas iniciales, plan del dia y tracking.

### Fase 4: Escudo Nativo Android

- Development build.
- Android `VpnService`.
- Accessibility Service.
- Bloqueo de apps.
- Horarios y pantalla de interrupcion.

## Implementation Decisions

- Mantener Expo Router.
- Mantener diseno basado en Figma carbon/lima.
- Usar Supabase para login, comunidad y sincronizacion.
- Mantener AsyncStorage como cache local.
- Usar React Native Paper solo como base cuando aporte; estilos principales con `StyleSheet`.
- No implementar IA real todavia; empezar con coaches deterministicos basados en reglas y contenido local.

## Testing Decisions

- Unit tests para calculos: rachas, calorias, agua, sueno y planes.
- E2E web para smoke: app carga, tabs visibles, no runtime overlay.
- Pruebas manuales en celular para UX real.
- Development build Android solo cuando empiece VPN/Accessibility.

## Out Of Scope Inicial

- Feed publico sin moderacion.
- Chat privado entre usuarios.
- IA generativa con llamadas pagas.
- Bloqueo real de apps en Expo Go.
- iOS nativo hasta estabilizar Android.

## Success Metrics

- La app abre en celular en menos de 5 segundos.
- Usuario puede crear cuenta y marcar habitos en menos de 2 minutos.
- Usuario entiende que el escudo nativo aun requiere build Android.
- Usuario puede publicar un testimonio y ver respuestas.
- Habitos 2.0 se sienten como guia personal, no checklist generico.
