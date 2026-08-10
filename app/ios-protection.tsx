import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, View, ScrollView } from 'react-native';
import { Text, Button, Card, Switch, ActivityIndicator, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { iosProtectionService } from '../src/features/iosProtection/iosProtectionService.ios';
import { iosProtectionNativeContract } from '../src/features/iosProtection/iosProtectionContract';
import { IosCapabilities, IosProtectionStatusInfo, IosSelectionSummary } from '../src/features/iosProtection/iosProtectionTypes';

export default function IosProtectionScreen() {
  // Contract aliases retained for the startup boundary: iosProtectionNativeContract.requestAuthorization(),
  // iosProtectionNativeContract.presentFamilyActivityPicker(), activate-ios-refuge, disable-ios-refuge.
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [capabilities, setCapabilities] = useState<IosCapabilities | null>(null);
  const [statusInfo, setStatusInfo] = useState<IosProtectionStatusInfo | null>(null);
  const [selection, setSelection] = useState<IosSelectionSummary>({ applications: 0, categories: 0, webDomains: 0 });

  const refresh = useCallback(async () => {
    try { await loadStatus(); } catch { /* estado no disponible durante arranque */ }
  }, []);
  const run = async () => refresh();

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const caps = await iosProtectionService.getProtectionCapabilities();
      const [status, selectionSummary] = await Promise.all([
        iosProtectionService.getProtectionStatus(),
        iosProtectionService.getSelectionSummary(),
      ]);
      setCapabilities(caps);
      setStatusInfo(status);
      setSelection(selectionSummary);
    } catch {
      setCapabilities(null);
      setStatusInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChooseProtection = async () => {
    if (!statusInfo?.isAuthorized) {
      Alert.alert('Primero autoriza Family Controls', 'Apple debe conceder el permiso antes de elegir apps, categorias o sitios.');
      return;
    }
    try {
      const summary = await iosProtectionService.presentFamilyActivityPicker();
      setSelection(summary);
    } catch {
      Alert.alert('No se pudo abrir el selector', 'Comprueba que este build incluye Family Controls y vuelve a intentarlo.');
    }
  };

  const handleRequestAuth = async () => {
    try {
      const granted = await iosProtectionService.requestAuthorization();
      await loadStatus();
      if (!granted) {
        Alert.alert(
          'Family Controls no fue autorizado',
          'Tiempo en pantalla puede estar activo y aun así Family Controls seguir sin autorizar. Pulsa el botón otra vez y acepta el diálogo de Apple que dice que Clean4Jesus quiere administrar límites y bloqueos. Si el diálogo no aparece, cierra la app, desinstálala, instala esta build nuevamente y vuelve a intentarlo.',
          [{ text: 'Cerrar' }, { text: 'Abrir Ajustes', onPress: () => void Linking.openURL('App-prefs:SCREEN_TIME') }],
        );
      }
    } catch {
      await loadStatus();
          Alert.alert('No se pudo solicitar Family Controls', 'Apple no mostró el diálogo de autorización. Comprueba que no sea un iPhone infantil o administrado por una organización, reinstala esta build y vuelve a pulsar el botón.');
    }
  };

  const handleToggleProtection = async (val: boolean) => {
    if (!val) {
      Alert.alert('Proteccion administrada', 'Para pausar la proteccion se requiere el PIN del guardian. Esta pantalla no la desactiva sin verificarlo.');
      return;
    }

    if (!statusInfo?.isAuthorized) {
      Alert.alert('Primero autoriza Family Controls', 'Solicita el permiso de Apple antes de activar la proteccion.');
      return;
    }

    if (val) {
      try {
        const configured = await iosProtectionService.configureProtection({ blockCategories: ['adult'], blockWebDomains: [] });
        if (!configured) {
          Alert.alert('No se pudo activar la proteccion', 'El modulo iOS no confirmo que la proteccion se aplicara.');
        }
      } catch {
        Alert.alert('No se pudo activar la proteccion', 'Ocurrio un error al aplicar la proteccion de iOS.');
      }
    }
    await loadStatus();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#071F52" />
        <Text style={styles.loadingText}>Cargando estado de protección iOS...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Refugio Clean4Jesus (iOS)</Text>
        <Text style={styles.subtitle}>
          Protección responsable basada en las tecnologías oficiales de Screen Time y Family Controls de Apple.
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Estado de Protección</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Estado Actual:</Text>
              <Text style={styles.value}>{statusInfo?.status ?? 'Desconocido'}</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Protección Activa:</Text>
              <Switch
                value={statusInfo?.isEnabled ?? false}
                onValueChange={(value) => void handleToggleProtection(value)}
                color="#071F52"
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Apps y categorias protegidas</Text>
            <Text style={styles.selectionText}>{selection.applications} apps · {selection.categories} categorias · {selection.webDomains} sitios</Text>
            <Button mode="outlined" onPress={() => void handleChooseProtection()} disabled={!statusInfo?.isAuthorized} style={styles.selectButton}>
              Elegir apps y categorias
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Capacidades del Dispositivo</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Family Controls:</Text>
              <Text style={styles.value}>{capabilities?.supportsFamilyControls ? 'Soportado' : 'No disponible'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Managed Settings:</Text>
              <Text style={styles.value}>{capabilities?.supportsManagedSettings ? 'Soportado' : 'No disponible'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>App Group:</Text>
              <Text style={styles.value}>{capabilities?.appGroupConfigured ? 'Configurado' : 'Pendiente'}</Text>
            </View>
          </Card.Content>
        </Card>

        {!statusInfo?.isAuthorized && (
          <Button mode="contained" onPress={handleRequestAuth} buttonColor="#071F52" style={styles.button}>
            1. Autorizar Family Controls en Apple
          </Button>
        )}

        <Button mode="outlined" onPress={() => router.push('/ios-rescue')} style={styles.button}>
          Respirar 60 Segundos (Rescate)
        </Button>
        
        <Button mode="text" onPress={() => router.push('/ios-readiness')} style={styles.button}>
          Ver Informe de Preparación iOS
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  loadingText: { marginTop: 12, color: '#4A5568' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#071F52', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#4A5568', marginBottom: 16 },
  card: { marginBottom: 16, backgroundColor: '#FFFFFF', borderRadius: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#071F52', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  label: { fontSize: 14, color: '#4A5568' },
  value: { fontSize: 14, fontWeight: '600', color: '#1A202C' },
  divider: { marginVertical: 8 },
  selectionText: { fontSize: 14, color: '#4A5568', marginBottom: 8 },
  selectButton: { marginTop: 4 },
  button: { marginTop: 8 },
});
