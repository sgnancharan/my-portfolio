import type { IdentityNodeId } from "@/types";

export type ScreenSlot = {
  x: number;
  y: number;
  visible: number;
};

export const identityLayout = {
  ready: false,
  opacity: 1,
  core: { x: 0, y: 0, visible: 0 } satisfies ScreenSlot,
  nodes: {
    aiml: { x: 0, y: 0, visible: 0 },
    debugger: { x: 0, y: 0, visible: 0 },
    web: { x: 0, y: 0, visible: 0 },
    server: { x: 0, y: 0, visible: 0 },
    "local-ai": { x: 0, y: 0, visible: 0 },
    core: { x: 0, y: 0, visible: 0 },
  } as Record<IdentityNodeId, ScreenSlot>,
};

export const identityInteraction = {
  hovered: null as IdentityNodeId | null,
  focused: null as IdentityNodeId | null,
  open: null as IdentityNodeId | null,
  originX: 0,
  originY: 0,
};

type IdentityListener = () => void;
const listeners = new Set<IdentityListener>();

export function subscribeIdentity(listener: IdentityListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitIdentity() {
  listeners.forEach((listener) => listener());
}

export function hoverIdentity(id: IdentityNodeId | null) {
  if (identityInteraction.hovered === id) return;
  identityInteraction.hovered = id;
  emitIdentity();
}

export function openIdentity(id: IdentityNodeId, x: number, y: number) {
  identityInteraction.open = id;
  identityInteraction.originX = x;
  identityInteraction.originY = y;
  emitIdentity();
}

export function closeIdentity() {
  identityInteraction.open = null;
  emitIdentity();
}
