import { Link, useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet, Text,
  View
} from "react-native";
import { exportJobsCsv } from "../src/exportCsv";
import { loadJobs } from "../src/storage";
import { theme } from "../src/theme";
import type { Job } from "../src/types";

export default function Home() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  

  async function refresh() {
  const j = await loadJobs();
  j.sort((a, b) => b.createdAt - a.createdAt);
  setJobs(j);
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
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  marginBottom: 12,
},

  headerBtns: {
  flexDirection: "row",
  gap: 10,
  alignItems: "center",
  justifyContent: "center",
},


  title: {
  color: theme.text,
  fontSize: 28,
  fontWeight: "800",
  textAlign: "center",
},
sub: {
  color: theme.subtext,
  marginTop: 4,
  textAlign: "center",
},


  jobCard: {
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 14,
  borderRadius: 14,
  backgroundColor: theme.card,
  borderWidth: 1,
  borderColor: theme.border,
  marginTop: 10,
  textAlign: "center",
},

  jobTitle: {
  color: theme.text,
  fontSize: 16,
  fontWeight: "700",
  textAlign: "center",
},
jobSub: {
  color: theme.subtext,
  marginTop: 2,
  textAlign: "center",
},
jobMeta: {
  color: theme.subtext,
  marginTop: 6,
  fontSize: 12,
  textAlign: "center",
},
money: {
  color: theme.accent,
  fontWeight: "800",
  fontSize: 16,
  marginTop: 8,
  textAlign: "center",
},


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
    alignItems: "center",
  },

  card: {
  padding: 16,
  borderRadius: 16,
  backgroundColor: theme.card,
  borderWidth: 1,
  borderColor: theme.border,
  gap: 10,
  alignItems: "center",
},
label: {
  color: theme.subtext,
  fontWeight: "700",
  textAlign: "center",
  width: "100%",
},
input: {
  borderWidth: 1,
  borderColor: theme.border,
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 12,
  color: theme.text,
  width: "100%",
  textAlign: "center",
},

});


