/**
 * LyricWindow — Draggable lyrics overlay.
 *
 * Uses GlassFloat (reusable floating glass window primitive).
 */

import type { ReactNode } from "react";
import { GlassFloat } from "@/design-system";

interface LyricWindowProps {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
}

const WIN_WIDTH = 280;
const WIN_HEIGHT = 340;

export default function LyricWindow({ open, onClose, children }: LyricWindowProps) {
  return (
    <GlassFloat
      open={open}
      onClose={onClose}
      title="歌词"
      width={WIN_WIDTH}
      height={WIN_HEIGHT}
      positionKey="lyrics-window-position"
    >
      {children}
    </GlassFloat>
  );
}