import { Link, useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet, Text, TextInput, View
} from "react-native";
import { exportJobsCsv } from "../src/exportCsv";
import { loadJobs, loadPin } from "../src/storage";
import { theme } from "../src/theme";
import type { Job } from "../src/types";

export default function Home() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [locked, setLocked] = useState(false);
  const [pinInput, setPinInput] = useState("");

  async function refresh() {
    const [j, p] = await Promise.all([loadJobs(), loadPin()]);
    j.sort((a, b) => b.createdAt - a.createdAt);
    setJobs(j);

    // Lock only if a PIN exists AND we haven't unlocked yet during this session
    setLocked((prev) => prev || !!p);
    setPinInput("");
  }

  useEffect(() => {
    refresh();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [])
  );

  const totals = useMemo(() => {
    const income = jobs.reduce((sum, j) => sum + (j.flatRate || 0), 0);
    const materials = jobs.reduce((sum, j) => sum + (j.materials || 0), 0);
    const miles = jobs.reduce((sum, j) => sum + (j.miles || 0), 0);
    return { income, materials, miles };
  }, [jobs]);

  async function unlockAttempt(pin: string) {
    const saved = await loadPin();
    if (!saved) {
      setLocked(false);
      return;
    }
    if (pin === saved) {
      setLocked(false);
      setPinInput("");
    } else {
      Alert.alert("Wrong PIN", "Try again.");
      setPinInput("");
    }
  }

  useEffect(() => {
    if (pinInput.length === 4) unlockAttempt(pinInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinInput]);

  if (locked) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.title}>Enter PIN</Text>
          <Text style={styles.sub}>Task.Lab is locked</Text>

          <TextInput
            value={pinInput}
            onChangeText={(t) => setPinInput(t.replace(/\D/g, "").slice(0, 4))}
            keyboardType="number-pad"
            secureTextEntry
            placeholder="••••"
            placeholderTextColor={theme.subtext}
            style={styles.input}
          />

          <Link href="/settings" asChild>
            <Pressable style={styles.btnGhost}>
              <Text style={styles.btnGhostText}>Settings</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Jobs</Text>
          <Text style={styles.sub}>
            Income: ${totals.income.toFixed(2)} • Materials: $
            {totals.materials.toFixed(2)} • Miles: {totals.miles.toFixed(1)}
          </Text>
        </View>

        <View style={styles.headerBtns}>
  <Pressable
    style={styles.btnGhost}
    onPress={async () => {
  try {
    const result = await exportJobsCsv(jobs);

    if (Platform.OS === "web") {
      // RN Alert often doesn't show on web
      window.alert(`CSV downloaded: ${result.filename}`);
    } else {
      Alert.alert("Exported", `Saved/share: ${result.filename}`);
    }
  } catch (e: any) {
    console.error("CSV export failed:", e);

    if (Platform.OS === "web") {
      window.alert(`Export failed: ${e?.message ?? e}`);
    } else {
      Alert.alert("Export failed", e?.message ?? "Unknown error");
    }
  }
}}

  >
    <Text style={styles.btnGhostText}>Export</Text>
  </Pressable>

  <Link href="/settings" asChild>
    <Pressable style={styles.btnGhost}>
      <Text style={styles.btnGhostText}>Settings</Text>
    </Pressable>
  </Link>

  <Link href="/add-job" asChild>
    <Pressable style={styles.btnPrimary}>
      <Text style={styles.btnPrimaryText}>+ Add</Text>
    </Pressable>
  </Link>
</View>

      </View>

      {jobs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.sub}>No jobs yet. Tap “Add”.</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const total = (item.flatRate || 0) + (item.materials || 0);
            const date = new Date(item.createdAt).toLocaleString();
            return (
              <Pressable
                onPress={() => router.push(`/job/${item.id}`)}
                style={styles.jobCard}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle}>{item.customer}</Text>
                  <Text style={styles.jobSub} numberOfLines={1}>
                    {item.description || "No description"}
                  </Text>
                  <Text style={styles.jobMeta}>
                    {date} • Miles: {(item.miles ?? 0).toFixed(1)}
                  </Text>
                </View>

                <Text style={styles.money}>${total.toFixed(2)}</Text>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: theme.bg },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  headerBtns: { flexDirection: "row", gap: 10, alignItems: "center" },

  title: { color: theme.text, fontSize: 28, fontWeight: "800" },
  sub: { color: theme.subtext, marginTop: 4 },

  jobCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    marginTop: 10,
  },
  jobTitle: { color: theme.text, fontSize: 16, fontWeight: "700" },
  jobSub: { color: theme.subtext, marginTop: 2 },
  jobMeta: { color: theme.subtext, marginTop: 6, fontSize: 12 },

  money: { color: theme.accent, fontWeight: "800", fontSize: 16 },

  btnGhost: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  btnGhostText: { color: theme.text, fontWeight: "700" },

  btnPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.accent,
  },
  btnPrimaryText: { color: theme.bg, fontWeight: "900" },

  empty: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },

  card: {
    marginTop: 60,
    padding: 16,
    borderRadius: 16,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  input: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: theme.text,
    fontSize: 18,
    letterSpacing: 10,
    textAlign: "center",
  },
});


