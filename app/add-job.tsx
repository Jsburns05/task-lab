import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { loadJobs, saveJobs } from "../src/storage";
import { theme } from "../src/theme";
import type { Job } from "../src/types";

function toNumber(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export default function AddJob() {
  const router = useRouter();
  const [customer, setCustomer] = useState("");
  const [description, setDescription] = useState("");
  const [flatRate, setFlatRate] = useState("");
  const [materials, setMaterials] = useState("");
  const [miles, setMiles] = useState("");

  async function onSave() {
    const fr = toNumber(flatRate);
    if (!customer.trim()) return Alert.alert("Missing customer", "Add a name.");
    if (fr <= 0) return Alert.alert("Missing flat rate", "Must be > $0.");

    const job: Job = {
      id: String(Date.now()),
      createdAt: Date.now(),
      customer: customer.trim(),
      description: description.trim(),
      flatRate: fr,
      materials: materials.trim() ? toNumber(materials) : undefined,
      miles: miles.trim() ? toNumber(miles) : undefined,
    };

    const jobs = await loadJobs();
    jobs.push(job);
    await saveJobs(jobs);
    router.replace("/");
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.label}>Customer</Text>
        <TextInput
          value={customer}
          onChangeText={setCustomer}
          placeholder="John Doe"
          placeholderTextColor={theme.subtext}
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Replace faucet, patch drywall..."
          placeholderTextColor={theme.subtext}
          style={[styles.input, styles.textarea]}
          multiline
        />

        <Text style={styles.label}>Flat rate ($)</Text>
        <TextInput
          value={flatRate}
          onChangeText={setFlatRate}
          placeholder="200"
          placeholderTextColor={theme.subtext}
          style={styles.input}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Materials ($ optional)</Text>
        <TextInput
          value={materials}
          onChangeText={setMaterials}
          placeholder="35"
          placeholderTextColor={theme.subtext}
          style={styles.input}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Miles (optional)</Text>
        <TextInput
          value={miles}
          onChangeText={setMiles}
          placeholder="12.5"
          placeholderTextColor={theme.subtext}
          style={styles.input}
          keyboardType="decimal-pad"
        />

        <View style={styles.row}>
          <Pressable style={styles.btnGhost} onPress={() => router.back()}>
            <Text style={styles.btnGhostText}>Cancel</Text>
          </Pressable>

          <Pressable style={styles.btnPrimary} onPress={onSave}>
            <Text style={styles.btnPrimaryText}>Save Job</Text>
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
  label: { color: theme.subtext, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: theme.text,
  },
  textarea: { minHeight: 90, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 10, marginTop: 10 },
  btnGhost: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
  },
  btnGhostText: { color: theme.text, fontWeight: "800" },
  btnPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.accent,
    alignItems: "center",
  },
  btnPrimaryText: { color: theme.bg, fontWeight: "900" },
});
