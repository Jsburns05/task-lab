import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Job } from "./types";

const KEYS = {
  JOBS: "tasklab.jobs.v1",
  
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


