import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  Switch,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/features/i18n/I18nProvider";
import { hasPin } from "@/features/pin/pinService";
import { getIosProtectionText } from "@/features/i18n/iosProtectionText";
import {
  getIosAuthorizationErrorMessage,
  iosProtectionService,
} from "@/features/iosProtection/iosProtectionService.ios";
import { iosProtectionNativeContract } from "@/features/iosProtection/iosProtectionContract";
import type {
  IosCapabilities,
  IosPerAppLimitSummary,
  IosProtectionStatusInfo,
  IosSelectionSummary,
} from "@/features/iosProtection/iosProtectionTypes";

const emptySelection: IosSelectionSummary = {
  applications: 0,
  categories: 0,
  webDomains: 0,
};

const emptyLimitSummary: IosPerAppLimitSummary = {
  applications: 0,
  configuredApplications: 0,
  hasUserConfiguredLimits: false,
};

export default function IosProtectionScreen() {
  // Contract aliases retained for the startup boundary: iosProtectionNativeContract.requestAuthorization(),
  // iosProtectionNativeContract.presentFamilyActivityPicker(), activate-ios-refuge, disable-ios-refuge.
  void iosProtectionNativeContract;

  const router = useRouter();
  const { editLimits, editSelection } = useLocalSearchParams<{
    editLimits?: string;
    editSelection?: string;
  }>();
  const { language } = useI18n();
  const copy = getIosProtectionText(language);
  const [loading, setLoading] = useState(true);
  const [capabilities, setCapabilities] = useState<IosCapabilities | null>(null);
  const [statusInfo, setStatusInfo] = useState<IosProtectionStatusInfo | null>(null);
  const [selection, setSelection] = useState<IosSelectionSummary>(emptySelection);
  const [limitSummary, setLimitSummary] = useState<IosPerAppLimitSummary>(emptyLimitSummary);
  const selectionCount = selection.applications + selection.categories + selection.webDomains;
  const processedReturnAction = useRef<string | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const [caps, status, selectionSummary, perAppSummary] = await Promise.all([
        iosProtectionService.getProtectionCapabilities(),
        iosProtectionService.getProtectionStatus(),
        iosProtectionService.getSelectionSummary(),
        iosProtectionService.getPerAppLimitSummary(),
      ]);
      setCapabilities(caps);
      setStatusInfo(status);
      setSelection(selectionSummary);
      setLimitSummary(perAppSummary);
    } catch {
      setCapabilities(null);
      setStatusInfo(null);
      setSelection(emptySelection);
      setLimitSummary(emptyLimitSummary);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadStatus();
    }, [loadStatus]),
  );

  async function openPerAppLimitEditor() {
    try {
      const summary = await iosProtectionService.presentPerAppLimitEditor(language);
      setLimitSummary(summary);
      await loadStatus();

      if (await hasPin()) return;
      Alert.alert(copy.guardianSetupTitle, copy.guardianSetupBody, [
        {
          text: copy.createGuardianPin,
          onPress: () => router.push("/pin-setup?after=ios-limit-configured"),
        },
      ]);
    } catch (error) {
      const message = getIosAuthorizationErrorMessage(error);
      if (!message.toLowerCase().includes("cancel")) {
        Alert.alert(copy.limitErrorTitle, message);
      }
    }
  }

  async function requireGuardianPin(action: "edit-ios-limits" | "edit-ios-selection") {
    if (await hasPin()) {
      router.push(`/pin-verify?action=${action}`);
      return;
    }
    Alert.alert(copy.guardianSetupTitle, copy.guardianSetupRequiredBody, [
      {
        text: copy.createGuardianPin,
        onPress: () => router.push("/pin-setup?after=ios-limit-configured"),
      },
    ]);
  }

  async function openFamilyActivityPicker() {
    if (!statusInfo?.isAuthorized) {
      Alert.alert(copy.authorizeFirstTitle, copy.authorizeFirstBody);
      return;
    }

    try {
      const summary = await iosProtectionService.presentFamilyActivityPicker(language);
      setSelection(summary);
      setLimitSummary(await iosProtectionService.getPerAppLimitSummary());
      Alert.alert(copy.selectionSaved, copy.selectionSavedBody);
    } catch {
      Alert.alert(copy.pickerErrorTitle, copy.pickerErrorBody);
    }
  }

  async function handleChooseProtection() {
    if (limitSummary.hasUserConfiguredLimits) {
      await requireGuardianPin("edit-ios-selection");
      return;
    }
    await openFamilyActivityPicker();
  }

  async function handleRequestAuth() {
    try {
      const granted = await iosProtectionService.requestAuthorization();
      await loadStatus();
      if (!granted) {
        Alert.alert(copy.requestDeniedTitle, copy.requestDeniedBody);
      }
    } catch (error) {
      await loadStatus();
      Alert.alert(copy.requestErrorTitle, getIosAuthorizationErrorMessage(error));
    }
  }

  async function handleToggleProtection(value: boolean) {
    if (!value) {
      Alert.alert(copy.managedTitle, copy.managedBody);
      return;
    }
    if (!statusInfo?.isAuthorized) {
      Alert.alert(copy.activateFirstTitle, copy.activateFirstBody);
      return;
    }
    if (selectionCount === 0) {
      Alert.alert(copy.activateErrorTitle, copy.activateErrorBody);
      return;
    }

    try {
      const configured = await iosProtectionService.configureProtection({
        blockCategories: ["adult"],
        blockWebDomains: [],
        customShieldTitle: copy.shieldTitle,
        customShieldMessage: copy.shieldMessage,
        customShieldPrimaryLabel: copy.shieldPrimaryAction,
        customShieldSecondaryLabel: copy.shieldSecondaryAction,
      });
      if (!configured) {
        Alert.alert(copy.activateErrorTitle, copy.activateErrorBody);
      }
    } catch {
      Alert.alert(copy.activateErrorTitle, copy.activateErrorBody);
    }
    await loadStatus();
  }

  async function handleConfigurePerAppLimits() {
    if (selection.applications === 0) {
      Alert.alert(copy.limitErrorTitle, copy.limitErrorBody);
      return;
    }
    if (limitSummary.hasUserConfiguredLimits) {
      await requireGuardianPin("edit-ios-limits");
      return;
    }
    await openPerAppLimitEditor();
  }

  useEffect(() => {
    const action = editLimits === "1"
      ? "limits"
      : editSelection === "1"
        ? "selection"
        : null;
    if (!action || loading || processedReturnAction.current === action) return;

    processedReturnAction.current = action;
    router.setParams(action === "limits" ? { editLimits: undefined } : { editSelection: undefined });
    if (action === "limits") {
      void openPerAppLimitEditor();
    } else {
      void openFamilyActivityPicker();
    }
  }, [editLimits, editSelection, loading]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color="#071F52" size="large" />
        <Text style={styles.loadingText}>{copy.loading}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} testID="ios-protection-screen">
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>{copy.stateTitle}</Text>
            <View style={styles.row}>
              <Text style={styles.label}>{copy.currentState}:</Text>
              <Text style={styles.value}>{copy.status(statusInfo?.status)}</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>{copy.active}:</Text>
              <Switch
                color="#071F52"
                onValueChange={(value) => void handleToggleProtection(value)}
                value={statusInfo?.isEnabled ?? false}
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>{copy.limitTitle}</Text>
            <Text style={styles.selectionHelp}>{copy.limitHelp}</Text>
            <Text style={styles.selectionText}>
              {copy.configuredLimits(limitSummary.configuredApplications, limitSummary.applications)}
            </Text>
            <Button
              buttonColor="#071F52"
              disabled={!statusInfo?.isAuthorized || selection.applications === 0}
              mode="contained"
              onPress={() => void handleConfigurePerAppLimits()}
              style={styles.selectButton}
              testID="ios-per-app-limits"
            >
              {copy.configureLimits}
            </Button>
            <Text style={styles.selectionHelp}>{copy.limitPrivacy}</Text>
            <Text style={styles.pendingNotice}>{copy.limitCounterPending}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>{copy.selectionTitle}</Text>
            <Text style={styles.selectionText}>{copy.selection(selection)}</Text>
            <Text style={styles.selectionHelp}>{copy.selectionHelp}</Text>
            <Button
              buttonColor="#071F52"
              disabled={!statusInfo?.isAuthorized}
              mode="contained"
              onPress={() => void handleChooseProtection()}
              style={styles.selectButton}
              testID="ios-family-selection"
            >
              {selectionCount > 0 ? copy.changeSelection : copy.chooseSelection}
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>{copy.capabilities}</Text>
            <CapabilityRow
              label="Family Controls"
              value={capabilities?.supportsFamilyControls ? copy.supported : copy.unavailable}
            />
            <CapabilityRow
              label={copy.managedSettings}
              value={capabilities?.supportsManagedSettings ? copy.supported : copy.unavailable}
            />
            <CapabilityRow
              label={copy.appGroup}
              value={capabilities?.appGroupConfigured ? copy.configured : copy.pending}
            />
          </Card.Content>
        </Card>

        {!statusInfo?.isAuthorized ? (
          <Button
            buttonColor="#071F52"
            mode="contained"
            onPress={() => void handleRequestAuth()}
            style={styles.button}
          >
            {copy.authorize}
          </Button>
        ) : null}

        <Button mode="text" onPress={() => router.push("/ios-readiness")} style={styles.button}>
          {copy.readiness}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

function CapabilityRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: 8 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 12, marginBottom: 16 },
  cardTitle: { color: "#071F52", fontSize: 16, fontWeight: "600", marginBottom: 12 },
  center: { alignItems: "center", flex: 1, justifyContent: "center" },
  container: { backgroundColor: "#F5F7FA", flex: 1 },
  content: { padding: 16 },
  divider: { marginVertical: 8 },
  label: { color: "#4A5568", flex: 1, fontSize: 14 },
  loadingText: { color: "#4A5568", marginTop: 12 },
  pendingNotice: { color: "#8A5A00", fontSize: 12, lineHeight: 18, marginTop: 10 },
  row: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  selectButton: { marginTop: 12 },
  selectionHelp: { color: "#667085", fontSize: 12, lineHeight: 18, marginTop: 6 },
  selectionText: { color: "#1A202C", fontSize: 15, fontWeight: "600" },
  subtitle: { color: "#4A5568", fontSize: 14, marginBottom: 16 },
  title: { color: "#071F52", fontSize: 24, fontWeight: "bold", marginBottom: 6 },
  value: { color: "#1A202C", fontSize: 14, fontWeight: "600" },
});
