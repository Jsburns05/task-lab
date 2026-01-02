import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import type { Job } from "./types";
const DEFAULT_MILEAGE_RATE = 0.67; // dollars per mile (edit as needed)

function escapeCsv(value: unknown) {
  const s = String(value ?? "");
  // wrap in quotes if contains comma/quote/newline; escape quotes by doubling
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function jobsToCsv(jobs: Job[]) {
  const headers = [
  "id",
  "createdAt",
  "date",
  "customer",
  "description",
  "flatRate",
  "materials",
  "miles",
  "mileageRate",
  "mileageDeduction",
  "net",
  "netAfterMileage",
  "total",
];


  const rows = jobs.map((j) => {
    const date = new Date(j.createdAt).toISOString();
    const materials = j.materials ?? 0;
const miles = j.miles ?? 0;

const total = (j.flatRate || 0) + materials;
const net = (j.flatRate || 0) - materials;

const mileageRate = DEFAULT_MILEAGE_RATE;
const mileageDeduction = miles * mileageRate;

const netAfterMileage = net - mileageDeduction;

return [
  j.id,
  j.createdAt,
  date,
  j.customer,
  j.description,
  j.flatRate,
  j.materials ?? "",
  j.miles ?? "",
  mileageRate,
  mileageDeduction,
  net,
  netAfterMileage,
  total,
].map(escapeCsv);


  });

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function downloadWeb(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportJobsCsv(jobs: Job[]) {
  const safeDate = new Date().toISOString().slice(0, 10);
  const filename = `task-lab-jobs-${safeDate}.csv`;
  const csv = jobsToCsv(jobs);

  if (Platform.OS === "web") {
    downloadWeb(filename, csv);
    return { filename };
  }

  const uri = FileSystem.documentDirectory + filename; // better than cache
  await FileSystem.writeAsStringAsync(uri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    // still return success + path
    return { filename };
  }

  await Sharing.shareAsync(uri, {
    mimeType: "text/csv",
    dialogTitle: "Export Task.Lab jobs (CSV)",
    UTI: "public.comma-separated-values-text",
  });

  return { filename };
}

