"use client";

import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  type Camera,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PointLight,
  SRGBColorSpace,
  Vector3,
} from "three";
import { identityNodes, PROFILE_PHOTO } from "@/data/identity-nodes";
import { identityInteraction, identityLayout } from "@/lib/identity-state";
import { pointerState, scrollState, viewportState } from "@/lib/scroll-state";

const tmp = new Vector3();
const coreTmp = new Vector3();
const NODE_IDS = identityNodes.map((node) => node.id);

function projectToScreen(
  world: Vector3,
  camera: Camera,
  rect: DOMRect,
  slot: { x: number; y: number; visible: number },
) {
  tmp.copy(world).project(camera);
  slot.x = (tmp.x * 0.5 + 0.5) * rect.width + rect.left;
  slot.y = (-tmp.y * 0.5 + 0.5) * rect.height + rect.top;
  slot.visible = tmp.z > 1 ? 0 : 1;
}

export function IdentityCore() {
  const texture = useTexture(PROFILE_PHOTO, (tex) => {
    if ("colorSpace" in tex) {
      tex.colorSpace = SRGBColorSpace;
      tex.anisotropy = 8;
      tex.repeat.set(1, 849 / 1024);
      tex.offset.set(0, (1024 - 849) / 1024);
      tex.needsUpdate = true;
    }
  });

  const root = useRef<Group>(null);
  const cage = useRef<Group>(null);
  const outerRing = useRef<Mesh>(null);
  const innerRing = useRef<Mesh>(null);
  const haloLight = useRef<PointLight>(null);
  const nodeGroups = useRef<(Group | null)[]>([]);
  const nodeMeshes = useRef<(Mesh | null)[]>([]);
  const nodeRings = useRef<(Mesh | null)[]>([]);
  const lines = useRef<(Line | null)[]>([]);

  const currentColor = useMemo(() => new Color("#38bdf8"), []);

  const lineGeometries = useMemo(
    () =>
      identityNodes.map(() => {
        const geometry = new BufferGeometry();
        geometry.setAttribute(
          "position",
          new Float32BufferAttribute(new Float32Array(6), 3),
        );
        return geometry;
      }),
    [],
  );

  const lineObjects = useMemo(() => {
    return lineGeometries.map((geometry, index) => {
      const material = new LineBasicMaterial({
        color: identityNodes[index].color,
        transparent: true,
        opacity: 0.18,
        blending: AdditiveBlending,
        depthWrite: false,
      });
      return new Line(geometry, material);
    });
  }, [lineGeometries]);

  useEffect(() => {
    lineObjects.forEach((line, index) => {
      lines.current[index] = line;
    });
  }, [lineObjects]);

  useFrame((state, delta) => {
    const group = root.current;
    if (!group) return;

    const reduced = viewportState.reducedMotion;
    const t = state.clock.elapsedTime;
    const hero = Math.min(1, Math.max(0, 1 - scrollState.progress / 0.22));
    identityLayout.opacity = hero;
    identityLayout.ready = true;

    const isMobile = viewportState.isMobile;
    const baseScale = isMobile ? 0.72 : 1;
    const active = identityInteraction.hovered ?? identityInteraction.open;
    const isCoreHovered = active === "core";

    const breathe = reduced ? 0 : Math.sin(t * 0.8) * 0.018;
    const coreHoverScale = isCoreHovered ? 0.06 : 0;
    const currentScale = (0.92 + hero * 0.16 + breathe + coreHoverScale) * baseScale;
    group.scale.setScalar(currentScale);

    // Dynamic spatial tilt aligned with mouse pointer & active node
    group.lookAt(state.camera.position);
    if (!reduced) {
      const targetTiltY = pointerState.x * 0.22;
      const targetTiltX = -pointerState.y * 0.16;
      group.rotateY(targetTiltY);
      group.rotateX(targetTiltX);

      // If a node is active, subtly lean towards its angular direction
      if (active && active !== "core") {
        const activeNode = identityNodes.find((n) => n.id === active);
        if (activeNode) {
          const leanX = Math.cos(activeNode.angle) * 0.04;
          const leanY = Math.sin(activeNode.angle) * 0.04;
          group.rotateY(leanX);
          group.rotateX(leanY);
        }
      }
    }

    // Rotating tech cage & outer rings
    if (cage.current && !reduced) {
      const cageSpeed = isCoreHovered ? 0.25 : 0.1;
      cage.current.rotation.y += delta * cageSpeed;
      cage.current.rotation.x = Math.sin(t * 0.25) * 0.08;
    }

    if (outerRing.current && !reduced) {
      outerRing.current.rotation.z -= delta * (isCoreHovered ? 0.35 : 0.12);
    }

    // Dynamic light & ring color based on active node
    let targetHex = "#38bdf8";
    if (active && active !== "core") {
      const nodeDef = identityNodes.find((n) => n.id === active);
      if (nodeDef) targetHex = nodeDef.color;
    } else if (isCoreHovered) {
      targetHex = "#60a5fa";
    }

    currentColor.lerp(new Color(targetHex), 1 - Math.exp(-8 * delta));

    if (haloLight.current) {
      haloLight.current.color.copy(currentColor);
      haloLight.current.intensity = isCoreHovered ? 8.5 : active ? 7 : 5;
    }

    if (innerRing.current) {
      const ringMat = innerRing.current.material as MeshBasicMaterial;
      ringMat.color.copy(currentColor);
      ringMat.opacity = isCoreHovered ? 0.95 : active ? 0.85 : 0.65;
    }

    // Screen-space projection for 2D HUD synchronization
    const rect = state.gl.domElement.getBoundingClientRect();
    group.getWorldPosition(coreTmp);
    projectToScreen(coreTmp, state.camera, rect, identityLayout.core);
    identityLayout.nodes.core = identityLayout.core;

    const radiusBoost = isMobile ? 0.78 : 1;
    const damp = 1 - Math.exp(-10 * delta);
    const lineDamp = 1 - Math.exp(-12 * delta);

    identityNodes.forEach((def, index) => {
      const nodeGroup = nodeGroups.current[index];
      const mesh = nodeMeshes.current[index];
      const ring = nodeRings.current[index];
      if (!nodeGroup) return;

      const isNodeActive = active === def.id;
      const orbit = reduced ? 0 : Math.sin(t * def.speed + def.phase) * 0.09;
      const extra = isNodeActive ? 0.18 : 0;
      const r = (def.radius + orbit + extra) * radiusBoost;
      const px = Math.cos(def.angle) * r + (reduced ? 0 : pointerState.x * 0.14);
      const py = Math.sin(def.angle) * r * 0.78 - (reduced ? 0 : pointerState.y * 0.12);
      nodeGroup.position.set(px, py, 0.08);

      // Node mesh scaling and emissive glow
      if (mesh) {
        const targetScale = isNodeActive ? 1.6 : isCoreHovered ? 1.2 : 1;
        mesh.scale.lerp(tmp.setScalar(targetScale), damp);
        const mat = mesh.material as MeshStandardMaterial;
        mat.emissiveIntensity = isNodeActive ? 2.2 : isCoreHovered ? 1.2 : 0.7;
      }

      // Orbiting micro-ring
      if (ring) {
        if (!reduced) {
          ring.rotation.z += delta * (isNodeActive ? 2.4 : 0.6);
        }
        const targetRingScale = isNodeActive ? 1.4 : 1;
        ring.scale.lerp(tmp.setScalar(targetRingScale), damp);
      }

      // 3D connection lines to central photo
      const line = lines.current[index];
      const positions = lineGeometries[index].getAttribute("position");
      positions.setXYZ(0, 0, 0, 0.04);
      positions.setXYZ(1, px, py, 0.08);
      positions.needsUpdate = true;

      if (line) {
        const material = line.material as LineBasicMaterial;
        const lineTarget = isNodeActive
          ? 0.95
          : isCoreHovered
            ? 0.65
            : 0.14 + hero * 0.08;
        material.opacity += (lineTarget - material.opacity) * lineDamp;
      }

      nodeGroup.getWorldPosition(tmp);
      projectToScreen(tmp, state.camera, rect, identityLayout.nodes[def.id]);
    });
  });

  return (
    <group ref={root} position={[0, 0.18, 0]}>
      {/* Outer Holographic Cage */}
      <group ref={cage}>
        <mesh scale={1.75}>
          <icosahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#5ea5c6" wireframe transparent opacity={0.14} />
        </mesh>
        <mesh rotation={[Math.PI / 2.2, 0.15, 0]}>
          <torusGeometry args={[1.56, 0.012, 8, 96]} />
          <meshBasicMaterial color="#7ec8e6" transparent opacity={0.35} />
        </mesh>
        <mesh rotation={[0.45, Math.PI / 3.2, 0.28]}>
          <torusGeometry args={[1.82, 0.007, 8, 96]} />
          <meshBasicMaterial color="#9d95d1" transparent opacity={0.24} />
        </mesh>
      </group>

      {/* Outer Segmented Calibration Ring */}
      <mesh ref={outerRing} rotation={[0, 0, 0]}>
        <ringGeometry args={[1.38, 1.41, 64]} />
        <meshBasicMaterial color="#8fb8cc" transparent opacity={0.3} wireframe />
      </mesh>

      {/* Middle Concentric Tech Ring */}
      <mesh>
        <ringGeometry args={[1.28, 1.305, 72]} />
        <meshBasicMaterial color="#68a4c2" transparent opacity={0.4} />
      </mesh>

      {/* Inner Active Rim Ring */}
      <mesh ref={innerRing}>
        <ringGeometry args={[1.18, 1.25, 72]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
      </mesh>

      {/* Central Portrait Disc (The Human Core) */}
      <mesh>
        <circleGeometry args={[1.18, 72]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {/* Front Holographic Glass Protective Lens */}
      <mesh position={[0, 0, 0.015]}>
        <circleGeometry args={[1.18, 72]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.1}
          roughness={0.08}
          transmission={0.35}
          color="#d4ecff"
        />
      </mesh>

      {/* Dark Backing Disc */}
      <mesh position={[0, 0, -0.03]}>
        <circleGeometry args={[1.2, 72]} />
        <meshBasicMaterial color="#04070e" />
      </mesh>

      {/* Dynamic Key Light Focused on Face & Holographic HUD */}
      <pointLight
        ref={haloLight}
        color="#38bdf8"
        intensity={5.5}
        distance={12}
        position={[0, 0, 1.6]}
      />

      {/* 5 Surrounding 3D Floating Node Beacons */}
      {identityNodes.map((def, index) => (
        <group
          key={def.id}
          ref={(el) => {
            nodeGroups.current[index] = el;
          }}
        >
          <mesh
            ref={(el) => {
              nodeMeshes.current[index] = el;
            }}
          >
            <sphereGeometry args={[0.095, 24, 24]} />
            <meshStandardMaterial
              color={def.color}
              emissive={def.color}
              emissiveIntensity={0.8}
              roughness={0.25}
              metalness={0.3}
            />
          </mesh>
          <mesh
            ref={(el) => {
              nodeRings.current[index] = el;
            }}
            rotation={[Math.PI / 3, 0.25, 0]}
          >
            <ringGeometry args={[0.16, 0.185, 32]} />
            <meshBasicMaterial
              color={def.color}
              transparent
              opacity={0.5}
              side={DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* 3D Connecting Energy Lines */}
      {lineObjects.map((lineObj, index) => (
        <primitive key={NODE_IDS[index]} object={lineObj} />
      ))}
    </group>
  );
}
