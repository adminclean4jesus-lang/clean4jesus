import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function IosReadinessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Informe de Preparación iOS</Text>
        <Text style={styles.subtitle}>
          Estado de paridad y preparación técnica para la versión de iOS.
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Capas Listas (Compartidas)</Text>
            <Text style={styles.item}>✓ Autenticación (Supabase + Google OAuth PKCE)</Text>
            <Text style={styles.item}>✓ Palabra (Devocionales y Planes con Cache Offline)</Text>
            <Text style={styles.item}>✓ Comunidad (Testimonios, Oraciones y Moderación)</Text>
            <Text style={styles.item}>✓ Internacionalización (ES, EN, FR, PT-BR)</Text>
            <Text style={styles.item}>✓ Temas (Modo Claro / Modo Oscuro)</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Capa Nativa iOS (Screen Time)</Text>
            <Text style={styles.item}>✓ Contratos TypeScript y Adaptadores</Text>
            <Text style={styles.item}>✓ Módulo Swift Nativo (Clean4JesusIosProtection)</Text>
            <Text style={styles.item}>✓ Configuración de Targets Natividades (Extensiones)</Text>
            <Text style={styles.item}>✓ App Group (`group.com.clean4jesus.app`)</Text>
            <Text style={styles.item}>✓ Interrupción Visual Nativa y Rescate de 60s</Text>
          </Card.Content>
        </Card>

        <Button mode="contained" onPress={() => router.back()} buttonColor="#071F52" style={styles.button}>
          Volver
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#071F52', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#4A5568', marginBottom: 16 },
  card: { marginBottom: 16, backgroundColor: '#FFFFFF', borderRadius: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#071F52', marginBottom: 12 },
  item: { fontSize: 14, color: '#2D3748', marginBottom: 6 },
  button: { marginTop: 8 },
});
