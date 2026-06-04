import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cpu, MemoryStick, HardDrive, Monitor, Activity, Clock, Database, ArrowRight, Music } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { getActivities, type ActivityEntry } from "@/hooks/useActivityLog";
import { useLanguage } from "@/contexts/LanguageContext";
import type { SystemInfo, BackupEntry, Language } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import { getAnimDuration, EASE_OUT } from "@/utils/animations";

interface DashboardProps {
  onNavigate: (page: any) => void;
}

const t = {
  zh: {
    title: "\u4eea\u8868\u76d8",
    cpu: "CPU",
    memory: "\u5185\u5b58",
    disk: "\u78c1\u76d8",
    system: "\u7cfb\u7edf",
    windowsVersion: "Windows \u7248\u672c",
    quickAccess: "\u5feb\u6377\u5165\u53e3",
    win32Priority: "Win32 \u4f18\u5148\u7ea7",
    win32Desc: "\u7ba1\u7406\u7cfb\u7edf CPU \u8c03\u5ea6\u4f18\u5148\u7ea7",
    appCpuPriority: "\u5e94\u7528 CPU \u4f18\u5148\u7ea7",
    appCpuDesc: "\u7ba1\u7406\u5e94\u7528\u7a0b\u5e8f CPU/I/O \u4f18\u5148\u7ea7",
    musicManager: "\u97f3\u4e50\u7ba1\u7406\u5668",
    musicDesc: "\u97f3\u9891\u6807\u7b7e\u7f16\u8f91\u4e0e\u6587\u4ef6\u7ba1\u7406",
    recentActivity: "\u64cd\u4f5c\u5386\u53f2",
    recentBackups: "\u6700\u8fd1\u5907\u4efd",
    noActivity: "\u6682\u65e0\u64cd\u4f5c\u8bb0\u5f55",
    noBackups: "\u6682\u65e0\u5907\u4efd",
    loading: "\u52a0\u8f7d\u4e2d...",
    viewAll: "\u67e5\u770b\u5168\u90e8",
  },
  en: {
    title: "Dashboard",
    cpu: "CPU",
    memory: "Memory",
    disk: "Disk",
    system: "System",
    windowsVersion: "Windows Version",
    quickAccess: "Quick Access",
    win32Priority: "Win32 Priority",
    win32Desc: "Manage system CPU scheduling priority",
    appCpuPriority: "App CPU Priority",
    appCpuDesc: "Manage application CPU/I/O priority",
    musicManager: "Music Manager",
    musicDesc: "Audio tag editor & file management",
    recentActivity: "Recent Activity",
    recentBackups: "Recent Backups",
    noActivity: "No recent activity",
    noBackups: "No backups",
    loading: "Loading...",
    viewAll: "View All",
  },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatTimeAgo(iso: string, lang: Language): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return lang === "zh" ? "\u521a\u521a" : "just now";
  if (diff < 3600) return lang === "zh" ? `${Math.floor(diff / 60)} \u5206\u949f\u524d` : `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return lang === "zh" ? `${Math.floor(diff / 3600)} \u5c0f\u65f6\u524d` : `${Math.floor(diff / 3600)}h ago`;
  return lang === "zh" ? `${Math.floor(diff / 86400)} \u5929\u524d` : `${Math.floor(diff / 86400)}d ago`;
}

const moduleLabels: Record<string, string> = {
  win32priority: "Win32 Priority",
  appcpupriority: "App CPU Priority",
  musicmanager: "Music Manager",
  backupcenter: "Backup Center",
};

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(true);

  useEffect(() => {
    const fetchSysInfo = async () => {
      try {
        const result = await window.electronAPI?.python.call("system.info");
        if (result) setSysInfo(result);
      } catch {}
    };
    fetchSysInfo();
    const interval = setInterval(fetchSysInfo, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setActivities(getActivities().slice(0, 5));
  }, []);

  useEffect(() => {
    const fetchBackups = async () => {
      const result = await window.electronAPI?.python.call("backup.list");
      if (result?.backups) setBackups(result.backups.slice(0, 5));
      setLoadingBackups(false);
    };
    fetchBackups();
  }, []);

  const { settings } = useTheme();
  const animationDuration = getAnimDuration(settings.animationSpeed);

  const statCards = [
    {
      icon: <Cpu size={20} />,
      label: tx.cpu,
      value: sysInfo ? `${sysInfo.cpu_percent}%` : tx.loading,
      sub: sysInfo ? `${sysInfo.cpu_count_physical ?? sysInfo.cpu_count} C / ${sysInfo.cpu_count} T` : "",
      color: "var(--accent)",
    },
    {
      icon: <MemoryStick size={20} />,
      label: tx.memory,
      value: sysInfo ? `${sysInfo.memory_percent}%` : tx.loading,
      sub: sysInfo
        ? `${formatBytes(sysInfo.memory_used)} / ${formatBytes(sysInfo.memory_total)}`
        : "",
      color: "var(--success)",
    },
    {
      icon: <HardDrive size={20} />,
      label: tx.disk,
      value: sysInfo ? `${sysInfo.disk_percent}%` : tx.loading,
      sub: sysInfo ? `${formatBytes(sysInfo.disk_used)} / ${formatBytes(sysInfo.disk_total)}` : "",
      color: "var(--warning)",
    },
    {
      icon: <Monitor size={20} />,
      label: tx.system,
      value: sysInfo ? `Build ${sysInfo.windows_build}` : tx.loading,
      sub: sysInfo ? sysInfo.hostname : "",
      color: "var(--text-secondary)",
    },
  ];

  const quickLinks = [
    {
      icon: <Cpu size={22} />,
      title: tx.win32Priority,
      desc: tx.win32Desc,
      page: "win32priority" as const,
    },
    {
      icon: <Activity size={22} />,
      title: tx.appCpuPriority,
      desc: tx.appCpuDesc,
      page: "appcpupriority" as const,
    },
    {
      icon: <Music size={22} />,
      title: tx.musicManager,
      desc: tx.musicDesc,
      page: "musicmanager" as const,
    },
  ];

  return (
    <motion.div
      animate={{ opacity: 1 }}
      transition={{ duration: animationDuration, ease: EASE_OUT }}
      style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
        {tx.title}
      </h1>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {statCards.map((card, i) => (
          <GlassCard key={i} style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${card.color}18`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: card.color, flexShrink: 0,
            }}>
              {card.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {card.label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {card.value}
              </div>
              {card.sub && (
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {card.sub}
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Quick Access */}
      <div>
        <h2 style={{
          fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase",
          letterSpacing: "0.06em", marginBottom: 12, paddingLeft: 4,
        }}>
          {tx.quickAccess}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          {quickLinks.map((link) => (
            <GlassCard key={link.page} onClick={() => onNavigate(link.page)} style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "var(--accent-bg)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--accent)",
                }}>
                  {link.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                    {link.title}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{link.desc}</div>
                </div>
                <ArrowRight size={16} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Recent Activity + Backups */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <GlassCard style={{ overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Clock size={16} style={{ color: "var(--text-secondary)" }} />
            <h3 style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
              {tx.recentActivity}
            </h3>
          </div>
          {activities.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 24, fontSize: 13 }}>
              {tx.noActivity}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activities.map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 0", borderBottom: i < activities.length - 1 ? "1px solid var(--border-color)" : "none",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.description}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
                      {moduleLabels[a.module] ?? a.module}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)", flexShrink: 0, marginLeft: 12 }}>
                    {formatTimeAgo(a.timestamp, lang)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard style={{ overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Database size={16} style={{ color: "var(--text-secondary)" }} />
            <h3 style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
              {tx.recentBackups}
            </h3>
          </div>
          {loadingBackups ? (
            <div style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 24, fontSize: 13 }}>
              {tx.loading}
            </div>
          ) : backups.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 24, fontSize: 13 }}>
              {tx.noBackups}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {backups.map((bp, i) => (
                <div key={bp.filename} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 0", borderBottom: i < backups.length - 1 ? "1px solid var(--border-color)" : "none",
                }}>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-primary)" }}>
                      {bp.date} {bp.time}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "monospace" }}>
                      {lang === "zh" ? "\u503c" : "Value"}: {bp.decimal} (0x{bp.hex?.replace("0x", "")})
                    </div>
                  </div>
                </div>
              ))}
              {backups.length >= 5 && (
                <button className="btn-secondary" onClick={() => onNavigate("backupcenter")}
                  style={{ fontSize: 11, padding: "6px 12px", alignSelf: "center", marginTop: 4 }}>
                  {tx.viewAll}
                </button>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
}