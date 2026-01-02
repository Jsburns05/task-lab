import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Job } from "./types";

const KEYS = {
  JOBS: "tasklab.jobs.v1",
  PIN: "tasklab.pin.v1",
};

export async function loadJobs(): Promise<Job[]> {
  const raw = await AsyncStorage.getItem(KEYS.JOBS);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as Job[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function saveJobs(jobs: Job[]) {
  await AsyncStorage.setItem(KEYS.JOBS, JSON.stringify(jobs));
}

export async function loadPin(): Promise<string | null> {
  const pin = await AsyncStorage.getItem(KEYS.PIN);
  return pin ?? null;
}

export async function savePin(pin: string) {
  await AsyncStorage.setItem(KEYS.PIN, pin);
}

export async function clearPin() {
  await AsyncStorage.removeItem(KEYS.PIN);
}
