import type { SupportedLanguage } from "./i18n";

const copies: Record<SupportedLanguage, { readDoneBody: string }> = {
  es: { readDoneBody: "Ya registraste la lectura de hoy. Ahora quédate con una idea clara y un paso pequeño para vivirla." },
  en: { readDoneBody: "You recorded today's reading. Keep one clear idea and one small step to live it out." },
  fr: { readDoneBody: "La lecture du jour est enregistrée. Garde une idée claire et un petit pas pour la vivre." },
  pt: { readDoneBody: "Você registrou a leitura de hoje. Guarde uma ideia clara e um pequeno passo para vivê-la." },
};

export const getWordSecondaryText = (language: SupportedLanguage) => copies[language];
