/**
 * GlassBackground — Dynamic Background Layer
 *
 * Provides the visual depth behind glass surfaces.
 * Supports gradient mesh, subtle noise texture, and
 * animated light rays to give glass something to refract.
 *
 * Renders at z-index 0 behind all content.
 */

import { useMemo } from "react";

export interface GlassBackgroundProps {
  /** Gradient accent hue (0-360). Default dynamically adapts to theme accent. */
  accentHue?: number;
  /** Whether to show animated light orbs */
  animated?: boolean;
  /** Opacity of the background pattern (0-1). Default 0.4. */
  intensity?: number;
}

export function GlassBackground({
  accentHue,
  animated = true,
  intensity = 0.4,
}: GlassBackgroundProps) {
  const gradientStyle = useMemo(() => {
    const hue = accentHue ?? 220;
    return {
      background: `
        radial-gradient(
          ellipse 60% 50% at 20% 30%,
          hsla(${hue}, 70%, 60%, ${intensity * 0.5}) 0%,
          transparent 60%
        ),
        radial-gradient(
          ellipse 50% 40% at 80% 70%,
          hsla(${(hue + 40) % 360}, 60%, 55%, ${intensity * 0.4}) 0%,
          transparent 55%
        ),
        radial-gradient(
          ellipse 40% 35% at 50% 50%,
          hsla(${(hue + 200) % 360}, 50%, 65%, ${intensity * 0.25}) 0%,
          transparent 50%
        ),
        var(--bg-base)
      `,
    };
  }, [accentHue, intensity]);

  return (
    <div
      className={"glass-background" + (animated ? " glass-background-animated" : "")}
      style={gradientStyle}
      aria-hidden="true"
    />
  );
}

export default GlassBackground;
