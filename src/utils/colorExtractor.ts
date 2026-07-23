/**
 * ????????????
 * ????????????????????????
 */

// --- ?? ---

export type RGB = [number, number, number];
export type HSL = [number, number, number];

// --- HSL ?? ---

export function rgbToHsl([r, g, b]: RGB): HSL {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === nr) h = ((ng - nb) / d + (ng < nb ? 6 : 0)) / 6;
    else if (max === ng) h = ((nb - nr) / d + 2) / 6;
    else h = ((nr - ng) / d + 4) / 6;
  }
  return [h, s, l];
}

export function hslToRgb([h, s, l]: HSL): RGB {
  let r = 0, g = 0, b = 0;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// --- ??????? ---

/**
 * ? base64 ??? offscreen canvas ?????
 * ?????? + ??????????????
 */
export function extractDominantColor(base64: string): RGB | null {
  try {
    const img = new Image();
    // ???????????? Promise ???
    return null;
  } catch {
    return null;
  }
}

/**
 * ??? base64 ???????
 * ????? + ?????????
 */
export async function extractDominantColorAsync(base64: string): Promise<RGB | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        // ??? 50x50 ???
        const size = 50;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        // ????? 16 ?
        const quantize = 4; // 256 / 64 = 4 ??? (64^3 = 262k ?)
        const colorMap = new Map<string, number>();
        let maxCount = 0;
        let dominantKey = "";

        for (let i = 0; i < data.length; i += 4) {
          const r = Math.floor(data[i] / quantize) * quantize;
          const g = Math.floor(data[i + 1] / quantize) * quantize;
          const b_ = Math.floor(data[i + 2] / quantize) * quantize;
          const a = data[i + 3];
          // ????????/????
          if (a < 128) continue;
          const brightness = (r + g + b_) / 3;
          if (brightness < 30 || brightness > 225) continue;

          const key = `${r},${g},${b_}`;
          const count = (colorMap.get(key) || 0) + 1;
          colorMap.set(key, count);
          if (count > maxCount) {
            maxCount = count;
            dominantKey = key;
          }
        }

        if (dominantKey) {
          const [r, g, b_] = dominantKey.split(",").map(Number);
          resolve([r, g, b_]);
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = base64;
  });
}

// --- ?????? ---

/**
 * ??????????????
 * ?? 5 ? RGB ?? + ????
 */
export function generateCoverPalette(dominant: RGB): {
  colors: RGB[];
  background: RGB;
} {
  const [h, s, l] = rgbToHsl(dominant);

  // ??????? 5 ???? + ???
  const colors: RGB[] = [
    dominant,
    hslToRgb([(h + 0.05) % 1, Math.min(1, s * 1.1), Math.min(0.8, l * 1.15)]),
    hslToRgb([(h + 0.12) % 1, Math.min(1, s * 0.9), Math.max(0.2, l * 0.85)]),
    hslToRgb([(h - 0.08 + 1) % 1, Math.min(1, s * 1.05), Math.min(0.75, l + 0.1)]),
    hslToRgb([(h + 0.45) % 1, Math.min(1, s * 0.6), Math.min(0.7, l * 0.9)]),
  ];

  // ????????
  const background: RGB = hslToRgb([h, Math.min(1, s * 0.4), Math.max(0.04, l * 0.15)]);

  return { colors, background };
}
