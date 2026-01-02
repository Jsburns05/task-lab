import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
<Stack>
  <Stack.Screen name="index" options={{ title: "Task.Lab" }} />
  <Stack.Screen name="add-job" options={{ title: "Add Job" }} />
  <Stack.Screen name="settings" options={{ title: "Settings" }} />
  <Stack.Screen name="job/[id]" options={{ title: "Job" }} />
</Stack>
