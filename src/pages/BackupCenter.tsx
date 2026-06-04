import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Trash2, FolderOpen, Download } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { useToast } from "@/contexts/ToastContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import type { BackupEntry } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import { getAnimDuration, EASE_OUT } from "@/utils/animations";


function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

interface Props {}

const t = {
  zh: {
    title: "备份中心",
    openDir: "打开备份目录",
    restore: "恢复",
    delete: "删除",
    export: "导出",
    source: "来源",
    noBackups: "暂无备份文件",
    restoreConfirm: "确定要恢复此备份吗？",
    deleteConfirm: "确定要删除此备份吗？",
    decimal: "十进制",
    hex: "十六进制",
    restored: "备份已恢复",
    deleted: "备份已删除",
    exported: "备份已导出",
    exportFailed: "导出失败",
  },
  en: {
    title: "Backup Center",
    openDir: "Open Backup Folder",
    restore: "Restore",
    delete: "Delete",
    export: "Export",
    source: "Source",
    noBackups: "No backup files",
    restoreConfirm: "Restore this backup?",
    deleteConfirm: "Delete this backup?",
    decimal: "Decimal",
    hex: "Hexadecimal",
    restored: "Backup restored",
    deleted: "Backup deleted",
    exported: "Backup exported",
    exportFailed: "Export failed",
  },
}

export default function BackupCenter(_props: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [backupDir, setBackupDir] = useState("");
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBackups = useCallback(async () => {
    const result = await window.electronAPI?.python.call("backup.list");
    if (result && !result.error) setBackups(result.backups ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBackups(); window.electronAPI?.python.call("backup.dir").then(r => { if (r?.dir) setBackupDir(r.dir); }); }, [fetchBackups]);

  const restoreBackup = async (bp: BackupEntry) => {
    const ok = await confirm({ title: tx.restoreConfirm, danger: false });
    if (!ok) return;
    const result = await window.electronAPI?.python.call("backup.restore", { filepath: bp.filepath });
    if (result?.success) {
      showToast(tx.restored, "success");
      fetchBackups();
    }
  };

  const deleteBackup = async (bp: BackupEntry) => {
    const ok = await confirm({ title: tx.deleteConfirm, danger: true });
    if (!ok) return;
    const result = await window.electronAPI?.python.call("backup.delete", { filename: bp.filename });
    if (result?.success) {
      showToast(tx.deleted, "success");
      fetchBackups();
    }
  };

  const openBackupDir = () => {
    window.electronAPI?.shell.openPath(backupDir);
  };

  const exportBackup = async (bp: BackupEntry) => {
    const dest = await window.electronAPI?.dialog.saveFile({
      defaultPath: bp.filename,
      filters: [{ name: "Registry Files", extensions: ["reg"] }],
    });
    if (!dest) return;
    const result = await window.electronAPI?.python.call("backup.export", {
      filepath: bp.filepath,
      dest: dest,
    });
    if (result?.success) {
      showToast(tx.exported, "success");
    } else {
      showToast(result?.error ?? tx.exportFailed, "error");
    }
  };
  const { settings } = useTheme();
  const animationDuration = getAnimDuration(settings.animationSpeed);


  return (
    <motion.div animate={{ opacity: 1 }} transition={{ duration: animationDuration, ease: EASE_OUT }} style={{ maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)" }}>{tx.title}</h1>
        <button className="btn-secondary" onClick={openBackupDir} style={{ padding: "6px 14px", fontSize: 12 }}>
          <FolderOpen size={12} /> {tx.openDir}
        </button>
      </div>

      {loading ? (
        <GlassCard><div style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 40 }}>...</div></GlassCard>
      ) : backups.length === 0 ? (
        <GlassCard>
          <div style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 40 }}>
            <FolderOpen size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
            <div style={{ fontSize: 13 }}>{tx.noBackups}</div>
          </div>
        </GlassCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {backups.map((bp) => (
            <div key={bp.filename} className="glass-card" style={{
              padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>
                  {bp.date} {bp.time}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em" }}>
                  {tx.decimal}: {bp.decimal} | {tx.hex}: {bp.hex}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 2 }}>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                    {tx.source}: {(bp as any).module === "win32" ? "Win32 Priority" : (bp as any).module ?? "N/A"}
                  </span>
                  {(bp as any).size !== undefined && (
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                      {formatBytes((bp as any).size)}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-secondary" onClick={() => exportBackup(bp)} style={{ padding: "6px 14px", fontSize: 12 }}>
                  <Download size={12} /> {tx.export}
                </button>
                <button className="btn-secondary" onClick={() => restoreBackup(bp)} style={{ padding: "6px 14px", fontSize: 12 }}>
                  <RotateCcw size={12} /> {tx.restore}
                </button>
                <button className="btn-secondary" onClick={() => deleteBackup(bp)} style={{ padding: "6px 14px", fontSize: 12 }}>
                  <Trash2 size={12} /> {tx.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
