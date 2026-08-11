import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { iosProtectionService } from '../src/features/iosProtection/iosProtectionService.ios';

export default function IosRescueScreen() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(60);
  const [phase, setPhase] = useState<'Inhala' | 'Sostén' | 'Exhala'>('Inhala');

  useEffect(() => {
    iosProtectionService.startRescue();

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        const cycle = (60 - prev + 1) % 12;
        if (cycle < 4) setPhase('Inhala');
        else if (cycle < 6) setPhase('Sostén');
        else setPhase('Exhala');

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Text style={styles.title}>Respirar 60 Segundos</Text>
          <Text style={styles.disclaimer}>
            Esta pausa no desactiva tu protección. Solo te ayuda a recuperar un momento de decisión.
          </Text>

          <View style={styles.timerCircle}>
            <Text style={styles.phaseText}>{seconds > 0 ? phase : 'Completado'}</Text>
            <Text style={styles.timerText}>{seconds}s</Text>
          </View>

          <Text style={styles.verse}>
            "No nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio." (2 Timoteo 1:7)
          </Text>

          <Button mode="contained" onPress={() => router.back()} buttonColor="#071F52" style={styles.button}>
            Volver
          </Button>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071F52', justifyContent: 'center', padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 8 },
  content: { alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#071F52', marginBottom: 8, textAlign: 'center' },
  disclaimer: { fontSize: 13, color: '#4A5568', textAlign: 'center', marginBottom: 24 },
  timerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#D69E2E',
  },
  phaseText: { fontSize: 16, fontWeight: '600', color: '#071F52' },
  timerText: { fontSize: 32, fontWeight: 'bold', color: '#D69E2E' },
  verse: { fontSize: 14, fontStyle: 'italic', color: '#2D3748', textAlign: 'center', marginBottom: 24 },
  button: { width: '100%' },
});
