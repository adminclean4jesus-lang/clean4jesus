import { MaterialCommunityIcons } from "@/components/MaterialCommunityIcon";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useI18n } from "@/features/i18n/I18nProvider";
import { SupportedLanguage } from "@/features/i18n/i18n";
import { fonts, ThemeColors } from "@/theme";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const totalSeconds = 60;
const copy = {
  es: { eyebrow: "Rescate guiado", title: "Respira. No estás solo.", body: "Esta pausa no quita la protección ni abre la app limitada.", inhale: "Inhala", hold: "Sostén", exhale: "Exhala", done: "Pausa completada", doneBody: "El Refugio sigue activo. Puedes volver a un lugar seguro.", back: "Volver al Refugio" },
  en: { eyebrow: "Guided rescue", title: "Breathe. You are not alone.", body: "This pause does not remove protection or open the limited app.", inhale: "Inhale", hold: "Hold", exhale: "Exhale", done: "Pause complete", doneBody: "The Refuge remains active. You can return to a safer place.", back: "Back to Refuge" },
  fr: { eyebrow: "Pause guidée", title: "Respirez. Vous n’êtes pas seul.", body: "Cette pause ne retire pas la protection et n’ouvre pas l’app limitée.", inhale: "Inspirez", hold: "Retenez", exhale: "Expirez", done: "Pause terminée", doneBody: "Le Refuge reste actif. Vous pouvez revenir vers un espace sûr.", back: "Retour au Refuge" },
  pt: { eyebrow: "Resgate guiado", title: "Respire. Você não está sozinho.", body: "Esta pausa não remove a proteção nem abre o app limitado.", inhale: "Inspire", hold: "Segure", exhale: "Expire", done: "Pausa concluída", doneBody: "O Refúgio continua ativo. Você pode voltar a um lugar seguro.", back: "Voltar ao Refúgio" },
} satisfies Record<SupportedLanguage, Record<string, string>>;

function phaseFor(elapsed: number) {
  const cycle = elapsed % 12;
  if (cycle < 4) return "inhale" as const;
  if (cycle < 6) return "hold" as const;
  return "exhale" as const;
}

export default function IosRescueScreen() {
  const router = useRouter();
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const t = copy[language];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1_000);
    return () => clearInterval(timer);
  }, [remaining]);

  const completed = remaining === 0;
  const phase = phaseFor(totalSeconds - remaining);
  const phaseLabel = phase === "inhale" ? t.inhale : phase === "hold" ? t.hold : t.exhale;

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>{t.eyebrow}</Text>
        <Text style={styles.title}>{completed ? t.done : t.title}</Text>
        <Text style={styles.body}>{completed ? t.doneBody : t.body}</Text>

        <View style={[styles.orb, phase === "inhale" && styles.orbInhale, phase === "exhale" && styles.orbExhale]}>
          <MaterialCommunityIcons color={colors.onPrimary} name={completed ? "shield-check" : "weather-windy"} size={34} />
          <Text style={styles.count}>{completed ? "✓" : `0:${String(remaining).padStart(2, "0")}`}</Text>
          {!completed ? <Text style={styles.phase}>{phaseLabel}</Text> : null}
        </View>

        <Text style={styles.verse}>“En paz me acostaré y asimismo dormiré; porque solo tú, Señor, me haces vivir confiado.”</Text>
        <Text style={styles.reference}>Salmo 4:8</Text>
        <PrimaryButton label={t.back} onPress={() => router.replace("/ios-protection")} variant={completed ? "primary" : "ghost"} />
      </View>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    body: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, textAlign: "center" },
    container: { flex: 1, gap: 12, justifyContent: "center" },
    count: { color: colors.onPrimary, fontFamily: fonts.display, fontSize: 26 },
    eyebrow: { color: colors.accent, fontFamily: fonts.label, fontSize: 11, letterSpacing: 0.9, textAlign: "center", textTransform: "uppercase" },
    orb: { alignItems: "center", alignSelf: "center", backgroundColor: colors.primaryDark, borderColor: colors.accent, borderRadius: 999, borderWidth: 2, height: 190, justifyContent: "center", marginVertical: 18, width: 190 },
    orbExhale: { transform: [{ scale: 0.9 }] },
    orbInhale: { transform: [{ scale: 1.06 }] },
    phase: { color: colors.onPrimary, fontFamily: fonts.heading, fontSize: 12, opacity: 0.86 },
    reference: { color: colors.primary, fontFamily: fonts.heading, fontSize: 12, textAlign: "center" },
    title: { color: colors.text, fontFamily: fonts.display, fontSize: 27, lineHeight: 34, textAlign: "center" },
    verse: { color: colors.text, fontFamily: fonts.body, fontSize: 14, fontStyle: "italic", lineHeight: 22, paddingHorizontal: 12, textAlign: "center" },
  });
}
