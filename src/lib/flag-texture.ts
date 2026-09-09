import { CanvasTexture, ClampToEdgeWrapping, LinearFilter, SRGBColorSpace } from "three";

let cachedFlagTexture: CanvasTexture | null = null;

/**
 * Generates an authentic Three.js CanvasTexture of the Indian National Flag (Tricolor).
 * Compliant with official specifications:
 * - 3:2 aspect ratio (600x400)
 * - India Saffron (#FF671F) top stripe
 * - White (#FFFFFF) center stripe
 * - India Green (#046A38) bottom stripe
 * - Navy Blue (#000080) Ashoka Chakra at center with 24 evenly spaced spokes and hub
 */
export function getIndianFlagTexture(): CanvasTexture {
  if (cachedFlagTexture) {
    return cachedFlagTexture;
  }

  const width = 600;
  const height = 400;
  const stripeHeight = height / 3;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    const fallbackTexture = new CanvasTexture(canvas);
    return fallbackTexture;
  }

  // 1. Saffron (Kesari) top stripe
  ctx.fillStyle = "#FF671F";
  ctx.fillRect(0, 0, width, stripeHeight);

  // 2. White middle stripe
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, stripeHeight, width, stripeHeight);

  // 3. India Green bottom stripe
  ctx.fillStyle = "#046A38";
  ctx.fillRect(0, stripeHeight * 2, width, stripeHeight);

  // 4. Ashoka Chakra (Navy Blue #000080)
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = stripeHeight * 0.42; // ~56px
  const innerHubRadius = outerRadius * 0.18; // ~10px
  const navyColor = "#000080";

  ctx.strokeStyle = navyColor;
  ctx.fillStyle = navyColor;

  // Outer circular rim
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Central hub
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerHubRadius, 0, Math.PI * 2);
  ctx.fill();

  // 24 Spokes
  const numSpokes = 24;
  for (let i = 0; i < numSpokes; i++) {
    const angle = (i * 2 * Math.PI) / numSpokes;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    ctx.beginPath();
    ctx.lineWidth = 2.2;
    ctx.moveTo(centerX + innerHubRadius * cos, centerY + innerHubRadius * sin);
    ctx.lineTo(centerX + outerRadius * cos, centerY + outerRadius * sin);
    ctx.stroke();

    // Small circular beads between spokes on outer rim
    const beadAngle = angle + Math.PI / numSpokes;
    const beadX = centerX + (outerRadius - 2) * Math.cos(beadAngle);
    const beadY = centerY + (outerRadius - 2) * Math.sin(beadAngle);
    ctx.beginPath();
    ctx.arc(beadX, beadY, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.needsUpdate = true;

  cachedFlagTexture = texture;
  return texture;
}
