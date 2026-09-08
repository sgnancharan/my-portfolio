import type { CameraKeyframe, Vec3 } from "@/types";

export const cameraPath: readonly CameraKeyframe[] = [
  { progress: 0, position: [0.15, 0.35, 16.4], lookAt: [0, 0.1, 0], fov: 42 },
  { progress: 0.16, position: [-1.8, 0.55, 10.2], lookAt: [0.4, 0, -1], fov: 40 },
  { progress: 0.34, position: [2.1, 1.35, 4.6], lookAt: [-0.2, 0.15, -2.4], fov: 38 },
  { progress: 0.52, position: [-1.4, -0.4, -1.8], lookAt: [0.6, 0.3, -6], fov: 36 },
  { progress: 0.72, position: [0.9, 1.8, -9.4], lookAt: [0, 0.4, -14], fov: 34 },
  { progress: 1, position: [0, 0.2, -18.6], lookAt: [0, 0, -24], fov: 32 },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpVec(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

export function sampleCameraPath(progress: number): {
  position: Vec3;
  lookAt: Vec3;
  fov: number;
} {
  const p = Math.min(1, Math.max(0, progress));
  const last = cameraPath[cameraPath.length - 1];

  if (p <= cameraPath[0].progress) {
    return {
      position: cameraPath[0].position,
      lookAt: cameraPath[0].lookAt,
      fov: cameraPath[0].fov,
    };
  }

  if (p >= last.progress) {
    return { position: last.position, lookAt: last.lookAt, fov: last.fov };
  }

  let i = 0;
  while (i < cameraPath.length - 1 && cameraPath[i + 1].progress < p) {
    i += 1;
  }

  const a = cameraPath[i];
  const b = cameraPath[i + 1];
  const span = b.progress - a.progress || 1;
  const t = (p - a.progress) / span;
  const eased = t * t * (3 - 2 * t);

  return {
    position: lerpVec(a.position, b.position, eased),
    lookAt: lerpVec(a.lookAt, b.lookAt, eased),
    fov: lerp(a.fov, b.fov, eased),
  };
}
