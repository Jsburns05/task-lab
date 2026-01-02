import React, { useEffect, useState } from "react";
import {
    Alert,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { clearPin, loadPin, savePin } from "../src/storage";
import { theme } from "../src/theme";

export default function Settings() {
  const [existingPin, setExistingPin] = useState<string | null>(null);
  const [pin, setPin] = useState("");

  useEffect(() => {
    loadPin().then(setExistingPin);
  }, []);

  async function onSave() {
    if (pin.length !== 4) return Alert.alert("PIN must be 4 digits");
    await savePin(pin);
    setExistingPin(pin);
    setPin("");
    Alert.alert("Saved", "PIN updated.");
  }

  async function onRemove() {
    Alert.alert("Remove PIN?", "App will open without a lock.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await clearPin();
          setExistingPin(null);
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Security</Text>
        <Text style={styles.sub}>
          {existingPin ? "PIN enabled" : "No PIN set"}
        </Text>

        <TextInput
          value={pin}
          onChangeText={(t) => setPin(t.replace(/\D/g, "").slice(0, 4))}
          keyboardType="number-pad"
          secureTextEntry
          placeholder="1234"
          placeholderTextColor={theme.subtext}
          style={styles.input}
        />

        <View style={styles.row}>
          <Pressable style={styles.btnPrimary} onPress={onSave}>
            <Text style={styles.btnPrimaryText}>Save PIN</Text>
          </Pressable>

          <Pressable
            style={[styles.btnGhost, !existingPin && { opacity: 0.5 }]}
            disabled={!existingPin}
            onPress={onRemove}
          >
            <Text style={styles.btnGhostText}>Remove PIN</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: theme.bg },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 10,
  },
  title: { color: theme.text, fontSize: 22, fontWeight: "900" },
  sub: { color: theme.subtext },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: theme.text,
    fontSize: 18,
    letterSpacing: 4,
  },
  row: { flexDirection: "row", gap: 10 },
  btnPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.accent,
    alignItems: "center",
  },
  btnPrimaryText: { color: theme.bg, fontWeight: "900" },
  btnGhost: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
  },
  btnGhostText: { color: theme.text, fontWeight: "800" },
});
