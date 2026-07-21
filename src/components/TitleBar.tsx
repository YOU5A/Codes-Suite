import { Minus, Square, X, Copy } from "lucide-react";
import { GlassSurface, GlassButton } from "@/design-system";

interface TitleBarProps {
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

export default function TitleBar({ isMaximized, onToggleMaximize }: TitleBarProps) {
  const dragStyle = { WebkitAppRegion: "drag" } as React.CSSProperties;
  const noDragStyle = { WebkitAppRegion: "no-drag" } as React.CSSProperties;

  return (
    <GlassSurface
      tier="ultraThin"
      noBlur={false}
      styleOverrides={{ radius: 0, shadow: "none" }}
      style={{
        height: "var(--titlebar-height)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 8px",
        borderBottom: "1px solid var(--border-color)",
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        borderRadius: 0,
        ...dragStyle,
        flexShrink: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingLeft: 12,
        }}
      >
        <img src="./icon.png" alt="" style={{ width: 18, height: 18 }} />
        <span style={{
          fontSize: 13, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.01em",
        }}>
          Codes Suite
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 2, ...noDragStyle }}>
        <GlassButton variant="ghost" size="sm" onClick={() => window.electronAPI?.window.minimize()}
          style={{ width: 32, height: 32, minWidth: 32, padding: 0, borderRadius: 6, justifyContent: "center" }}
          aria-label="Minimize">
          <Minus size={14} strokeWidth={2} />
        </GlassButton>
        <GlassButton variant="ghost" size="sm" onClick={onToggleMaximize}
          style={{ width: 32, height: 32, minWidth: 32, padding: 0, borderRadius: 6, justifyContent: "center" }}
          aria-label={isMaximized ? "Restore" : "Maximize"}>
          {isMaximized ? <Copy size={12} strokeWidth={2} /> : <Square size={12} strokeWidth={2} />}
        </GlassButton>
        <GlassButton variant="ghost" size="sm" onClick={() => window.electronAPI?.window.close()}
          style={{ width: 32, height: 32, minWidth: 32, padding: 0, borderRadius: 6, justifyContent: "center" }}
          aria-label="Close"
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--danger)"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
          <X size={14} strokeWidth={2} />
        </GlassButton>
      </div>
    </GlassSurface>
  );
}
