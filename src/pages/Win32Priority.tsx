import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Save, RotateCcw, Trash2, FolderOpen } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { GlassButton, GlassInput } from "@/design-system";
import { useToast } from "@/contexts/ToastContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import { recordActivity } from "@/hooks/useActivityLog";
import type { RegistryValue, BackupEntry } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import { getAnimDuration, EASE_OUT } from "@/utils/animations";

interface Props {}

const t = {
  zh: {
    title: "Win32 PrioritySeparation",
    currentValue: "\u5f53\u524d\u503c",
    decimal: "\u5341\u8fdb\u5236",
    hex: "\u5341\u516d\u8fdb\u5236",
    binary: "\u4e8c\u8fdb\u5236",
    quickPresets: "\u5feb\u901f\u9884\u8bbe",
    customSet: "\u81ea\u5b9a\u4e49\u8bbe\u7f6e",
    enterValue: "\u8f93\u5165\u65b0\u503c\uff080x\u5f00\u5934\u6216\u76f4\u63a5\u8f93\u5165\u5341\u516d\u8fdb\u5236\uff09",
    apply: "\u5e94\u7528",
    refresh: "\u5237\u65b0",
    backups: "\u5907\u4efd\u7ba1\u7406",
    createBackup: "\u521b\u5efa\u5907\u4efd",
    openDir: "\u6253\u5f00\u5907\u4efd\u76ee\u5f55",
    restore: "\u6062\u590d",
    delete: "\u5220\u9664",
    noBackups: "\u65e0\u5907\u4efd",
    clearAll: "\u6e05\u9664\u6240\u6709\u5907\u4efd",
    clearAllConfirm: "\u786e\u5b9a\u8981\u5220\u9664\u6240\u6709\u5907\u4efd\u6587\u4ef6\u5417\uff1f\u6b64\u64cd\u4f5c\u4e0d\u53ef\u64a4\u9500\u3002",
    clearAllDone: "\u5df2\u6e05\u9664 {n} \u4e2a\u5907\u4efd\u6587\u4ef6",
    confirmSet: "\u786e\u5b9a\u8981\u8bbe\u7f6e\u6b64\u503c\u5417\uff1f\u9700\u8981\u7ba1\u7406\u5458\u6743\u9650\uff0c\u91cd\u542f\u540e\u751f\u6548\u3002",
    success: "\u8bbe\u7f6e\u6210\u529f\uff0c\u91cd\u542f\u540e\u751f\u6548",
    failed: "\u8bbe\u7f6e\u5931\u8d25",
    backupCreated: "\u5907\u4efd\u5df2\u521b\u5efa",
    restoreConfirm: "\u786e\u5b9a\u8981\u6062\u590d\u6b64\u5907\u4efd\u5417\uff1f",
    deleteConfirm: "\u786e\u5b9a\u8981\u5220\u9664\u6b64\u5907\u4efd\u5417\uff1f",
  },
  en: {
    title: "Win32 PrioritySeparation",
    currentValue: "Current Value",
    decimal: "Decimal",
    hex: "Hexadecimal",
    binary: "Binary",
    quickPresets: "Quick Presets",
    customSet: "Custom Setting",
    enterValue: "Enter value (0x prefix or hex)",
    apply: "Apply",
    refresh: "Refresh",
    backups: "Backup Management",
    createBackup: "Create Backup",
    openDir: "Open Backup Folder",
    restore: "Restore",
    delete: "Delete",
    noBackups: "No backups",
    clearAll: "Clear All Backups",
    clearAllConfirm: "Delete all backup files? This cannot be undone.",
    clearAllDone: "Deleted {n} backup files",
    confirmSet: "Set this value? Admin rights required. Takes effect after reboot.",
    success: "Value set successfully. Restart to apply.",
    failed: "Failed to set value",
    backupCreated: "Backup created",
    restoreConfirm: "Restore this backup?",
    deleteConfirm: "Delete this backup?",
  },
};

// Win32 PrioritySeparation Preset Table
// AA: Thread scheduling interval (short/long)
// BB: Interval type (fixed/variable)
// CC: Foreground/background CPU quantum ratio
interface PresetEntry {
  value: number;
  hex: string;
  aa: "short" | "long";
  bb: "fixed" | "variable";
  cc: "3:1" | "2:1" | "1:1";
  effect: string | null;
}

const presetData: PresetEntry[] = [
  { value: 42, hex: "2A", aa: "short", bb: "fixed", cc: "3:1", effect: "highest_fps" },
  { value: 41, hex: "29", aa: "short", bb: "fixed", cc: "2:1", effect: null },
  { value: 40, hex: "28", aa: "short", bb: "fixed", cc: "1:1", effect: "fast_response" },
  { value: 38, hex: "26", aa: "short", bb: "variable", cc: "3:1", effect: "program_default" },
  { value: 37, hex: "25", aa: "short", bb: "variable", cc: "2:1", effect: null },
  { value: 36, hex: "24", aa: "short", bb: "variable", cc: "1:1", effect: null },
  { value: 26, hex: "1A", aa: "long", bb: "fixed", cc: "3:1", effect: null },
  { value: 25, hex: "19", aa: "long", bb: "fixed", cc: "2:1", effect: null },
  { value: 24, hex: "18", aa: "long", bb: "fixed", cc: "1:1", effect: "background_default" },
  { value: 22, hex: "16", aa: "long", bb: "variable", cc: "3:1", effect: "smoothest" },
  { value: 21, hex: "15", aa: "long", bb: "variable", cc: "2:1", effect: null },
  { value: 20, hex: "14", aa: "long", bb: "variable", cc: "1:1", effect: null },
];

const aaLabel = {
  zh: { short: "\u77ed\u95f4\u9694", long: "\u957f\u95f4\u9694" },
  en: { short: "Short", long: "Long" },
} as const;

const bbLabel = {
  zh: { fixed: "\u56fa\u5b9a", variable: "\u53ef\u53d8" },
  en: { fixed: "Fixed", variable: "Variable" },
} as const;

const ccLabel = {
  zh: { "3:1": "\u524d\u540e\u53f0 3:1", "2:1": "\u524d\u540e\u53f0 2:1", "1:1": "\u524d\u540e\u53f0 1:1" },
  en: { "3:1": "FG/BG 3:1", "2:1": "FG/BG 2:1", "1:1": "FG/BG 1:1" },
} as const;

const effectLabel: Record<string, { zh: string; en: string }> = {
  highest_fps: { zh: "\u7f51\u4f20\u5e27\u6570\u6700\u9ad8", en: "Highest FPS" },
  fast_response: { zh: "\u636e\u79f0\u54cd\u5e94\u5668\u5feb", en: "Fast Response" },
  program_default: { zh: "\u7a0b\u5e8f\u9ed8\u8ba4\u503c", en: "Program Default" },
  background_default: { zh: "\u540e\u53f0\u9ed8\u8ba4\u503c", en: "Background Default" },
  smoothest: { zh: "\u6700\u6d41\u7545", en: "Smoothest" },
};

/** Parse user input: auto-detect hex (0x prefix or contains a-f) or decimal */
function parseValue(input: string): number | null {
  const s = input.trim();
  if (!s) return null;
  if (/^0x/i.test(s)) {
    const v = parseInt(s, 16);
    return isNaN(v) ? null : v;
  }
  if (/^[0-9a-fA-F]+$/.test(s) && /[a-fA-F]/.test(s)) {
    const v = parseInt(s, 16);
    return isNaN(v) ? null : v;
  }
  const v = parseInt(s, 10);
  return isNaN(v) ? null : v;
}

export default function Win32Priority(_props: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [regValue, setRegValue] = useState<RegistryValue | null>(null);
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [customValue, setCustomValue] = useState("");
  const [applying, setApplying] = useState(false);

  const fetchValue = useCallback(async () => {
    try {
      const result = await window.electronAPI?.python.call("registry.read");
      if (result && !result.error) setRegValue(result);
    } catch { /* bridge not ready, will retry */ }
  }, []);

  const fetchBackups = useCallback(async () => {
    try {
      const result = await window.electronAPI?.python.call("backup.list");
      if (result && !result.error) setBackups(result.backups ?? []);
    } catch { /* bridge not ready, will retry */ }
  }, []);

  useEffect(() => {
    fetchValue();
    fetchBackups();
  }, [fetchValue, fetchBackups]);

  const applyValue = async (value: number) => {
    const ok = await confirm({ title: tx.confirmSet, danger: false });
    if (!ok) return;
    setApplying(true);
    try {
      const result = await window.electronAPI?.python.call("registry.write", { value });
      setApplying(false);
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        showToast(tx.success, "success");
        recordActivity("win32", `${lang === "zh" ? "\u8bbe\u7f6e" : "Set"} Win32PrioritySeparation = ${value}`);
        fetchValue();
      }
    } catch (e: any) {
      setApplying(false);
      showToast(e?.message ?? tx.failed, "error");
    }
  };

  const createBackup = async () => {
    try {
      const result = await window.electronAPI?.python.call("registry.backup");
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        showToast(tx.backupCreated, "success");
        recordActivity("win32", lang === "zh" ? "\u521b\u5efa\u5907\u4efd" : "Backup created");
        fetchBackups();
      }
    } catch (e: any) {
      showToast(e?.message ?? tx.failed, "error");
    }
  };

  const restoreBackup = async (bp: BackupEntry) => {
    const ok = await confirm({ title: tx.restoreConfirm, danger: false });
    if (!ok) return;
    try {
      const result = await window.electronAPI?.python.call("backup.restore", { filepath: bp.filepath });
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        showToast(result.success ? tx.success : tx.failed, result.success ? "success" : "error");
        recordActivity("win32", `${lang === "zh" ? "\u6062\u590d\u5907\u4efd" : "Restored backup"} ${bp.filename}`);
        fetchValue();
        fetchBackups();
      }
    } catch (e: any) {
      showToast(e?.message ?? tx.failed, "error");
    }
  };

  const deleteBackup = async (bp: BackupEntry) => {
    const ok = await confirm({ title: tx.deleteConfirm, danger: true });
    if (!ok) return;
    try {
      const result = await window.electronAPI?.python.call("backup.delete", { filename: bp.filename });
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        showToast(tx.delete, "success");
        recordActivity("win32", `${lang === "zh" ? "\u5220\u9664\u5907\u4efd" : "Deleted backup"} ${bp.filename}`);
        fetchBackups();
      }
    } catch (e: any) {
      showToast(e?.message ?? tx.failed, "error");
    }
  };

  const clearAllBackups = async () => {
    const ok = await confirm({ title: tx.clearAllConfirm, danger: true });
    if (!ok) return;
    try {
      const result = await window.electronAPI?.python.call("backup.clear_all");
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        const n = result.deleted ?? 0;
        showToast(tx.clearAllDone.replace("{n}", String(n)), "success");
        recordActivity("win32", `${lang === "zh" ? "\u6e05\u9664\u6240\u6709\u5907\u4efd" : "Cleared all backups"} (${n})`);
        fetchBackups();
      }
    } catch (e: any) {
      showToast(e?.message ?? tx.failed, "error");
    }
  };

  const openBackupDir = async () => {
    try {
      const result = await window.electronAPI?.python.call("backup.dir");
      if (result?.dir) {
        await window.electronAPI?.shell.openPath(result.dir);
      }
    } catch { /* ignore */ }
  };
  const { settings } = useTheme();
  const animationDuration = getAnimDuration(settings.animationSpeed);


  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: animationDuration, ease: EASE_OUT }}
      style={{ padding: "24px 28px", maxWidth: 960, margin: "0 auto", width: "100%" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
          {tx.title}
        </h2>
        <GlassButton variant="secondary" onClick={() => { fetchValue(); fetchBackups(); }} style={{ padding: "6px 14px", fontSize: 12 }}>
          <RefreshCw size={14} /> {tx.refresh}
        </GlassButton>
      </div>

      {/* Current Value */}
      <GlassCard>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {tx.currentValue}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.03em", textTransform: "uppercase" }}>{tx.decimal}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "var(--accent-color)", letterSpacing: "-0.02em" }}>
              {regValue?.decimal ?? "-"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.03em", textTransform: "uppercase" }}>{tx.hex}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "var(--accent-color)", letterSpacing: "-0.02em" }}>
              {regValue?.hex ?? "-"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.03em", textTransform: "uppercase" }}>{tx.binary}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "0.02em", wordBreak: "break-all" }}>
              {regValue?.binary ?? "-"}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Quick Presets */}
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {tx.quickPresets}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {presetData.map((p) => (
            <button
              key={p.hex}
              className="btn-secondary"
              onClick={() => applyValue(p.value)}
              disabled={applying}
              style={{
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                padding: "10px 14px",
                minHeight: 120,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                  {p.hex}
                </span>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>
                  {p.value}
                </span>
              </div>
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
                <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 5, background: "var(--bg-tertiary)", color: "var(--text-secondary)", lineHeight: 1.4, border: "1px solid var(--border-color)" }}>
                  {aaLabel[lang][p.aa]}
                </span>
                <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 5, background: "var(--bg-tertiary)", color: "var(--text-secondary)", lineHeight: 1.4, border: "1px solid var(--border-color)" }}>
                  {bbLabel[lang][p.bb]}
                </span>
                <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 5, background: "var(--bg-tertiary)", color: "var(--text-secondary)", lineHeight: 1.4, border: "1px solid var(--border-color)" }}>
                  {ccLabel[lang][p.cc]}
                </span>
              </div>
              {p.effect && (
                <div style={{ fontSize: 11, color: "var(--accent-color)", fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>
                  {effectLabel[p.effect][lang]}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Setting */}
      <GlassCard style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {tx.customSet}
        </h3>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            className="input-field"
            placeholder={tx.enterValue}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            style={{ maxWidth: 240 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = parseValue(customValue);
                if (v !== null) applyValue(v);
              }
            }}
          />
          <GlassButton variant="primary" onClick={() => {
            const v = parseValue(customValue);
            if (v !== null) applyValue(v);
          }} disabled={applying}>
            <Save size={14} /> {tx.apply}
          </GlassButton>
        </div>
      </GlassCard>

      {/* Backup Management */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{tx.backups}</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <GlassButton variant="secondary" onClick={createBackup} style={{ padding: "6px 14px", fontSize: 12 }}>
              <Save size={12} /> {tx.createBackup}
            </GlassButton>
            <GlassButton variant="secondary" onClick={openBackupDir} style={{ padding: "6px 14px", fontSize: 12 }}>
              <FolderOpen size={12} /> {tx.openDir}
            </GlassButton>
            {backups.length > 0 && (
              <GlassButton variant="secondary" onClick={clearAllBackups} style={{ padding: "6px 14px", fontSize: 12, color: "var(--danger-color, #e74c3c)" }}>
                <Trash2 size={12} /> {tx.clearAll}
              </GlassButton>
            )}
          </div>
        </div>
        {backups.length === 0 ? (
          <div style={{ color: "var(--text-tertiary)", fontSize: 13, padding: "24px 0", textAlign: "center" }}>
            {tx.noBackups}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {backups.map((bp) => (
              <div key={bp.filename} className="glass-card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                    {bp.date} {bp.time}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>
                    {tx.decimal}: {bp.decimal} | {tx.hex}: {bp.hex}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <GlassButton variant="secondary" onClick={() => restoreBackup(bp)} style={{ padding: "5px 12px", fontSize: 11 }}>
                    <RotateCcw size={11} /> {tx.restore}
                  </GlassButton>
                  <GlassButton variant="secondary" onClick={() => deleteBackup(bp)} style={{ padding: "5px 12px", fontSize: 11 }}>
                    <Trash2 size={11} /> {tx.delete}
                  </GlassButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
