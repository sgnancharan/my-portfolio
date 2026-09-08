"use client";

import { Grid } from "@react-three/drei";

export function TechnicalGrid() {
  return (
    <Grid
      position={[0, -2.8, -4]}
      args={[24, 24]}
      cellSize={0.6}
      cellThickness={0.6}
      cellColor="#1a2a38"
      sectionSize={3}
      sectionThickness={1.1}
      sectionColor="#2b4558"
      fadeDistance={28}
      fadeStrength={1.4}
      infiniteGrid
    />
  );
}
