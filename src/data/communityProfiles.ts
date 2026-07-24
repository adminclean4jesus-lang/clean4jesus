export type CommunityProfile = {
  accent: "primary" | "accent" | "success";
  badge: string;
  city: string;
  headline: string;
  id: string;
  kind: "prayer" | "testimony" | "update";
  message: string;
  name: string;
  prayerCount: number;
  responseCount: number;
  role: string;
  streak: number;
  time: string;
};

export const communityProfiles: CommunityProfile[] = [
  {
    accent: "primary",
    badge: "Volviendo",
    city: "Bogota",
    headline: "Anoche cerre a tiempo",
    id: "andres",
    kind: "update",
    message:
      "Anoche volví al refugio antes de abrir otra pestaña. Me ayudó tener claro el siguiente paso y no improvisar con el celular en la mano.",
    name: "Andres",
    prayerCount: 4,
    responseCount: 2,
    role: "Nuevo",
    streak: 3,
    time: "Hace 3 min",
  },
  {
    accent: "success",
    badge: "Firme",
    city: "Medellin",
    headline: "La racha me está ayudando",
    id: "valeria",
    kind: "testimony",
    message:
      "La racha no me hace perfecta, pero sí me obliga a ser honesta. Antes me escondía varios días; ahora vuelvo mucho más rápido a la luz.",
    name: "Valeria",
    prayerCount: 19,
    responseCount: 6,
    role: "Constante",
    streak: 14,
    time: "Hace 11 min",
  },
  {
    accent: "accent",
    badge: "Agradecido",
    city: "Cali",
    headline: "Necesito oración esta noche",
    id: "samuel",
    kind: "prayer",
    message:
      "Hoy me siento vulnerable por cansancio y soledad. Quiero llegar a la noche con la mente clara, así que agradezco oración y un mensaje corto de apoyo.",
    name: "Samuel",
    prayerCount: 8,
    responseCount: 5,
    role: "Testimonio",
    streak: 7,
    time: "Hace 19 min",
  },
  {
    accent: "primary",
    badge: "Sirviendo",
    city: "Quito",
    headline: "Orar por otros me recentro",
    id: "nora",
    kind: "testimony",
    message:
      "Hoy ore por alguien más y eso cambio mi enfoque. Me saco del encierro mental y me recordo que la libertad tambien florece cuando dejamos de mirarnos solo a nosotros.",
    name: "Nora",
    prayerCount: 12,
    responseCount: 4,
    role: "Acompana",
    streak: 5,
    time: "Hace 28 min",
  },
  {
    accent: "success",
    badge: "Sosten",
    city: "Lima",
    headline: "Día silencioso, pero limpio",
    id: "david",
    kind: "update",
    message:
      "No hable mucho hoy, pero si marque mi día sin caer. Quiero aprender a valorar estos avances pequenos sin volverlos orgullo.",
    name: "David",
    prayerCount: 6,
    responseCount: 1,
    role: "Silencioso",
    streak: 2,
    time: "Hace 34 min",
  },
  {
    accent: "accent",
    badge: "Primer paso",
    city: "Pasto",
    headline: "Volvi con miedo",
    id: "carolina",
    kind: "prayer",
    message:
      "Entre con miedo y sali con una decision clara: seguir. Si alguien puede orar por mi primer fin de semana usando la app, me ayudaria bastante.",
    name: "Carolina",
    prayerCount: 3,
    responseCount: 3,
    role: "Nueva",
    streak: 1,
    time: "Hace 41 min",
  },
  {
    accent: "primary",
    badge: "Constante",
    city: "Barranquilla",
    headline: "La constancia tambien se aprende",
    id: "mateo",
    kind: "testimony",
    message:
      "La racha no me hace invencible. Me recuerda que todavía puedo avanzar y que permanecer en pequenos ritmos vale más que una semana intensa.",
    name: "Mateo",
    prayerCount: 26,
    responseCount: 7,
    role: "Firme",
    streak: 21,
    time: "Hace 52 min",
  },
  {
    accent: "success",
    badge: "Cuidando",
    city: "Santiago",
    headline: "Responder con ternura si sirve",
    id: "elena",
    kind: "update",
    message:
      "Responder con verdad y ternura vale más que esconderse. Hoy acompane a dos personas y me hizo bien ver que nadie tiene que cargar esto solo.",
    name: "Elena",
    prayerCount: 15,
    responseCount: 8,
    role: "Apoyo",
    streak: 9,
    time: "Hace 1 h",
  },
  {
    accent: "accent",
    badge: "Volver a empezar",
    city: "Cusco",
    headline: "No quiero que una caida mande",
    id: "jose",
    kind: "prayer",
    message:
      "Hoy fue difícil, pero no quiero dejar que una recaida defina todo el día. Oren por mi para volver a ordenar la tarde y no aislarme.",
    name: "Jose",
    prayerCount: 5,
    responseCount: 2,
    role: "En proceso",
    streak: 4,
    time: "Hace 2 h",
  },
  {
    accent: "primary",
    badge: "Orando",
    city: "Cartagena",
    headline: "La comunidad sí sostiene",
    id: "maria",
    kind: "testimony",
    message:
      "La comunidad me sostiene cuando la mente quiere volver atrás. A veces solo necesito leer que alguien más ya pasó por aquí y aún sigue con Cristo.",
    name: "Maria",
    prayerCount: 24,
    responseCount: 9,
    role: "Orante",
    streak: 11,
    time: "Hace 3 h",
  },
];

export const COMMUNITY_BASE_PRAYERS = 87;
export const COMMUNITY_BASE_REPLIES = 24;
