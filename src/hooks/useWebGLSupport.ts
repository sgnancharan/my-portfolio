import { useSyncExternalStore } from "react";
import { detectWebGL } from "@/lib/detect-webgl";

let cached: boolean | null = null;

function subscribe() {
  return () => undefined;
}

function getSnapshot() {
  if (cached === null) {
    cached = detectWebGL();
  }
  return cached;
}

function getServerSnapshot() {
  return true;
}

export function useWebGLSupport() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
