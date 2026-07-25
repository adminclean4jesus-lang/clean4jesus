import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { InfoCard } from "@/components/InfoCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { useAppAppearance } from "@/features/appearance/AppearanceProvider";
import { useI18n } from "@/features/i18n/I18nProvider";
import { getIosReadinessItems } from "@/features/iosProtection/iosProtectionContract";
import { SupportedLanguage } from "@/features/i18n/i18n";
import { getProtectionPlatformDescriptor } from "@/features/shield/protectionPlatform";
import { fonts, ThemeColors } from "@/theme";

type IosProtectionCopy = {
  body: string;
  capabilities: string;
  close: string;
  eyebrow: string;
  title: string;
  waiting: string;
};

const copyByLanguage: Record<SupportedLanguage, IosProtectionCopy> = {
  es: {
    eyebrow: "Preparación para iPhone",
    title: "Tu Refugio necesita una capa nativa de Apple",
    body: "Clean4Jesus mantiene Palabra, Comunidad, perfil y tus ajustes locales. El bloqueo de apps y los límites de uso se activarán aquí únicamente cuando las capacidades de Apple estén aprobadas y probadas en un iPhone real.",
    capabilities: "Capas que prepararemos: escudo de apps, límites de tiempo, pantalla de protección y filtro de red.",
    waiting: "No mostraremos el Refugio como activo hasta que esa protección exista de verdad en este dispositivo.",
    close: "Continuar sin protección nativa",
  },
  en: {
    eyebrow: "iPhone preparation",
    title: "Your Refuge needs an Apple-native layer",
    body: "Clean4Jesus keeps Word, Community, profile, and your local settings. App blocking and usage limits will only be enabled here after Apple capabilities are approved and tested on a real iPhone.",
    capabilities: "Layers we will prepare: app shielding, usage limits, a protection screen, and network filtering.",
    waiting: "We will not show Refuge as active until that protection truly exists on this device.",
    close: "Continue without native protection",
  },
  fr: {
    eyebrow: "Préparation pour iPhone",
    title: "Ton Refuge a besoin d'une couche native Apple",
    body: "Clean4Jesus conserve Parole, Communauté, profil et tes réglages locaux. Le blocage d'apps et les limites d'usage ne seront activés ici qu'après validation des capacités Apple sur un iPhone réel.",
    capabilities: "Couches prévues : protection d'apps, limites de temps, écran de protection et filtrage réseau.",
    waiting: "Nous n'afficherons pas le Refuge comme actif avant que cette protection existe réellement sur cet appareil.",
    close: "Continuer sans protection native",
  },
  pt: {
    eyebrow: "Preparação para iPhone",
    title: "Seu Refúgio precisa de uma camada nativa da Apple",
    body: "Clean4Jesus mantém Palavra, Comunidade, perfil e seus ajustes locais. O bloqueio de apps e os limites de uso só serão ativados aqui depois que os recursos da Apple forem aprovados e testados em um iPhone real.",
    capabilities: "Camadas que vamos preparar: proteção de apps, limites de uso, tela de proteção e filtro de rede.",
    waiting: "Não mostraremos o Refúgio como ativo até que essa proteção exista de verdade neste dispositivo.",
    close: "Continuar sem proteção nativa",
  },
};

export default function IosProtectionScreen() {
  const router = useRouter();
  const { colors } = useAppAppearance();
  const { language } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const copy = copyByLanguage[language];
  const protection = getProtectionPlatformDescriptor("ios");

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons color={colors.primary} name="shield-outline" size={34} />
        </View>
        <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.body}>{copy.body}</Text>
      </View>

      <InfoCard tone="light" style={styles.capabilityCard}>
        <Text style={styles.cardTitle}>{copy.capabilities}</Text>
        {protection.capabilities.map((capability) => (
          <View key={capability.id} style={styles.capabilityRow}>
            <MaterialCommunityIcons color={colors.muted} name="clock-outline" size={18} />
            <Text style={styles.capabilityLabel}>{capability.label}</Text>
          </View>
        ))}
      </InfoCard>

      <InfoCard tone="outline">
        <Text style={styles.waiting}>{copy.waiting}</Text>
      </InfoCard>

      <Pressable onPress={() => router.push("/ios-readiness")} style={styles.readinessLink}>
        <MaterialCommunityIcons color={colors.primary} name="clipboard-check-outline" size={18} />
        <Text style={styles.readinessText}>Ver preparación para iPhone ({getIosReadinessItems().filter((item) => item.ready).length}/{getIosReadinessItems().length})</Text>
      </Pressable>
      <PrimaryButton label={copy.close} onPress={() => router.replace("/(tabs)")} />
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    body: { color: colors.muted, fontFamily: fonts.body, fontSize: 16, lineHeight: 25 },
    capabilityCard: { gap: 14 },
    capabilityLabel: { color: colors.text, flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20 },
    capabilityRow: { alignItems: "center", flexDirection: "row", gap: 10 },
    cardTitle: { color: colors.text, fontFamily: fonts.heading, fontSize: 16, lineHeight: 23 },
    eyebrow: { color: colors.primary, fontFamily: fonts.label, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase" },
    hero: { gap: 12, paddingTop: 20 },
    readinessLink: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center", paddingVertical: 7 },
    readinessText: { color: colors.primary, fontFamily: fonts.heading, fontSize: 14 },
    iconWrap: { alignItems: "center", alignSelf: "flex-start", backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, height: 72, justifyContent: "center", width: 72 },
    title: { color: colors.text, fontFamily: fonts.display, fontSize: 30, lineHeight: 38 },
    waiting: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  });
}
