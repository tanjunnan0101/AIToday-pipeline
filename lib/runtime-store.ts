import type { AppData } from "@/lib/domain";
import { appData } from "@/lib/demo-data";

declare global {
  var __aitodayRuntimeStore: AppData | undefined;
}

export function getRuntimeStore() {
  if (!globalThis.__aitodayRuntimeStore) {
    globalThis.__aitodayRuntimeStore = structuredClone(appData);
  }

  return globalThis.__aitodayRuntimeStore;
}

export function resetRuntimeStore() {
  globalThis.__aitodayRuntimeStore = structuredClone(appData);
  return globalThis.__aitodayRuntimeStore;
}
