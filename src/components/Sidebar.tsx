import { motion } from "framer-motion";
import { springSnappy } from "@/design-system";
import {
  LayoutDashboard, Cpu, Gauge, Music, Database, Settings,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/hooks/useTheme";
import { GlassSurface } from "@/design-system";
import type { Page, Language } from "@/types";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navLabels: Record<Language, Record<Page, string>> = {
  zh: {
    dashboard: "\u4eea\u8868\u76d8",
    win32priority: "Win32 \u4f18\u5148\u7ea7",
    appcpupriority: "\u5e94\u7528 CPU \u4f18\u5148\u7ea7",
    musicmanager: "\u97f3\u4e50\u7ba1\u7406\u5668",
    backupcenter: "\u5907\u4efd\u4e2d\u5fc3",
    settings: "\u8bbe\u7f6e",
  },
  en: {
    dashboard: "Dashboard",
    win32priority: "Win32 Priority",
    appcpupriority: "App CPU Priority",
    musicmanager: "Music Manager",
    backupcenter: "Backup Center",
    settings: "Settings",
  },
};

const navItems: { id: Page; icon: React.ReactNode }[] = [
  { id: "dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "win32priority", icon: <Cpu size={18} /> },
  { id: "appcpupriority", icon: <Gauge size={18} /> },
  { id: "musicmanager", icon: <Music size={18} /> },
  { id: "backupcenter", icon: <Database size={18} /> },
  { id: "settings", icon: <Settings size={18} /> },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { lang } = useLanguage();
  const { settings } = useTheme();

  return (
    <GlassSurface
      tier="regular"
      styleOverrides={{ radius: 0, shadow: "none" }}
      style={{
        width: "var(--sidebar-width)",
        minWidth: 180,
        maxWidth: 320,
        display: "flex",
        flexDirection: "column",
        padding: settings.compactMode ? "8px 6px" : "12px 8px",
        borderRight: "1px solid var(--border-color)",
        borderTop: "none",
        borderBottom: "none",
        borderLeft: "none",
        gap: 2,
        flexShrink: 0,
        borderRadius: 0,
      }}
    >
      {navItems.map((item) => {
        const isActive = currentPage === item.id;
        return (
          <motion.button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            whileTap={{ scale: 0.97 }}
            transition={springSnappy}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: settings.compactMode ? "8px 10px" : "10px 14px",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: settings.compactMode ? 12 : 13,
              fontWeight: isActive ? 500 : 400,
              color: isActive ? "var(--accent)" : "var(--text-secondary)",
              background: isActive ? "var(--accent-bg)" : "transparent",
              transition: "all var(--transition-fast) ease",
              textAlign: "left",
              width: "100%",
            }}
          >
            {item.icon}
            <span>{navLabels[lang][item.id]}</span>
          </motion.button>
        );
      })}

      <div style={{ flex: 1 }} />

      <div
        style={{
          padding: settings.compactMode ? "8px 10px" : "12px 14px",
          fontSize: 11,
          color: "var(--text-tertiary)",
          textAlign: "center",
        }}
      >
        Codes Suite V1.1
      </div>
    </GlassSurface>
  );
}
