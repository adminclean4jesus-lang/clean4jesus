import { CommunityAuthGate } from "@/features/auth/CommunityAuthGate";
import { fonts } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Image, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NAVY = "#02174B";
const NAVY_DEEP = "#001238";
const GOLD = "#D9A441";

export function WelcomeAuthScreen() {
  const reveal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(reveal, { duration: 720, toValue: 1, useNativeDriver: true }).start();
  }, [reveal]);

  const heroMotion = {
    opacity: reveal,
    transform: [{
      translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }),
    }],
  };

  return (
    <LinearGradient colors={[NAVY_DEEP, NAVY, NAVY]} style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.hero, heroMotion]}>
            <View style={styles.haloOuter}>
              <View style={styles.haloInner}>
                <Image
                  accessibilityLabel="Logo oficial de Clean4Jesus"
                  resizeMode="contain"
                  source={require("../../../assets/splash-mark-transparent.png")}
                  style={styles.logo}
                />
              </View>
            </View>
            <Text style={styles.brand}>CLEAN4JESUS</Text>
            <Text style={styles.title}>Rompe el ciclo.{"\n"}Recupera tu libertad.</Text>
            <Text style={styles.subtitle}>
              Un refugio digital centrado en Cristo para proteger tus decisiones, recuperar el enfoque y caminar acompañado.
            </Text>
            <View style={styles.promiseRow}>
              <View style={styles.promiseLine} />
              <Text style={styles.promise}>TU CUENTA ES EL PRIMER PASO</Text>
              <View style={styles.promiseLine} />
            </View>
          </Animated.View>

          <View style={styles.authSheet}>
            <View style={styles.sheetHandle} />
            <CommunityAuthGate presentation="onboarding" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flexGrow: 1 },
  hero: {
    alignItems: "center",
    minHeight: 430,
    paddingBottom: 34,
    paddingHorizontal: 28,
    paddingTop: 34,
  },
  haloOuter: {
    alignItems: "center",
    backgroundColor: "rgba(249,168,37,0.10)",
    borderColor: "rgba(249,168,37,0.28)",
    borderRadius: 999,
    borderWidth: 1,
    height: 156,
    justifyContent: "center",
    marginBottom: 20,
    width: 156,
  },
  haloInner: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    height: 116,
    justifyContent: "center",
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    width: 116,
  },
  logo: { height: 90, width: 90 },
  brand: { color: GOLD, fontFamily: fonts.label, fontSize: 11, letterSpacing: 2.6, marginBottom: 13 },
  title: {
    color: "#FFFFFF",
    fontFamily: fonts.display,
    fontSize: 32,
    letterSpacing: -0.8,
    lineHeight: 40,
    maxWidth: 360,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.76)",
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 15,
    maxWidth: 340,
    textAlign: "center",
  },
  promiseRow: { alignItems: "center", flexDirection: "row", gap: 9, marginTop: 25, width: "100%" },
  promiseLine: { backgroundColor: "rgba(255,255,255,0.18)", flex: 1, height: 1 },
  promise: { color: "rgba(255,255,255,0.64)", fontFamily: fonts.label, fontSize: 9, letterSpacing: 1.2 },
  authSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    minHeight: 480,
    paddingBottom: 38,
    paddingHorizontal: 22,
    paddingTop: 13,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "#D9DFE8",
    borderRadius: 999,
    height: 4,
    marginBottom: 13,
    width: 42,
  },
});
