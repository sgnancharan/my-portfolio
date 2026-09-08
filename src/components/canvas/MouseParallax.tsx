"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import type { Group } from "three";
import { pointerState, viewportState } from "@/lib/scroll-state";

export function MouseParallax({ children }: { children: ReactNode }) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    const groupNode = group.current;
    if (!groupNode) return;

    const damp = 1 - Math.exp(-6 * delta);
    const intensity = viewportState.isMobile || viewportState.reducedMotion ? 0 : 1;

    pointerState.x += (pointerState.targetX * intensity - pointerState.x) * damp;
    pointerState.y += (pointerState.targetY * intensity - pointerState.y) * damp;

    groupNode.rotation.y = pointerState.x * 0.18;
    groupNode.rotation.x = -pointerState.y * 0.1;
    groupNode.position.x = pointerState.x * 0.35;
    groupNode.position.y = pointerState.y * 0.22;
  });

  return <group ref={group}>{children}</group>;
}
