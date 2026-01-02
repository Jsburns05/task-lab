import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { loadJobs, saveJobs } from "../../src/storage";
import { theme } from "../../src/theme";
import type { Job } from "../../src/types";

export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    loadJobs().then((jobs) => {
      const found = jobs.find((j) => j.id === id) || null;
      setJob(found);
    });
  }, [id]);

  const total = useMemo(() => {
    if (!job) return 0;
    return (job.flatRate || 0) + (job.materials || 0);
  }, [job]);

  async function onDelete() {
    Alert.alert("Delete job?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const jobs = await loadJobs();
          await saveJobs(jobs.filter((j) => j.id !== id));
          router.replace("/");
        },
      },
    ]);
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.title}>Job not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>{job.customer}</Text>
        <Text style={styles.sub}>
          {new Date(job.createdAt).toLocaleString()}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{job.description || "—"}</Text>

        <Text style={styles.label}>Flat rate</Text>
        <Text style={styles.value}>${job.flatRate.toFixed(2)}</Text>

        <Text style={styles.label}>Materials</Text>
        <Text style={styles.value}>
          ${Number(job.materials ?? 0).toFixed(2)}
        </Text>

        <Text style={styles.label}>Miles</Text>
        <Text style={styles.value}>{Number(job.miles ?? 0).toFixed(1)}</Text>

        <View style={styles.divider} />

        <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>

        <View style={styles.row}>
          <Pressable style={styles.btnGhost} onPress={() => router.back()}>
            <Text style={styles.btnGhostText}>Back</Text>
          </Pressable>

          <Pressable style={styles.btnDanger} onPress={onDelete}>
            <Text style={styles.btnDangerText}>Delete</Text>
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
  gap: 8,
  alignItems: "center",
},

  title: {
  color: theme.text,
  fontSize: 24,
  fontWeight: "900",
  textAlign: "center",
},
sub: {
  color: theme.subtext,
  textAlign: "center",
},
label: {
  color: theme.subtext,
  fontWeight: "800",
  marginTop: 6,
  textAlign: "center",
},
value: {
  color: theme.text,
  marginTop: 2,
  textAlign: "center",
},
total: {
  color: theme.accent,
  fontSize: 18,
  fontWeight: "900",
  textAlign: "center",
},

  row: { flexDirection: "row", gap: 10, marginTop: 12 },
  btnGhost: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
  },
  btnGhostText: { color: theme.text, fontWeight: "800" },
  btnDanger: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.danger,
    alignItems: "center",
  },
  btnDangerText: { color: theme.bg, fontWeight: "900" },
});
