import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, RefreshCw, Upload, Download } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { GlassButton, GlassInput, GlassModal, GlassSelect } from "@/design-system";
import { useToast } from "@/contexts/ToastContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import { recordActivity } from "@/hooks/useActivityLog";
import type { PriorityRule } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import { getAnimDuration, EASE_OUT } from "@/utils/animations";

interface Props {}

const t = {
  zh: {
    title: "应用程序 CPU / I/O 优先级",
    subtitle: "通过 Windows 注册表永久设置应用优先级",
    add: "添加应用",
    edit: "编辑",
    delete: "删除",
    refresh: "刷新",
    export: "导出配置",
    import: "导入配置",
    name: "应用名称",
    cpu: "CPU 优先级",
    io: "I/O 优先级",
    noRules: "暂无已配置的应用",
    addDialog: "添加应用优先级",
    editDialog: "编辑应用优先级",
    nameLabel: "应用名称 (exe)",
    cpuLabel: "CPU 优先级",
    ioLabel: "I/O 优先级",
    ioEnable: "启用 I/O 优先级",
    save: "保存",
    cancel: "取消",
    nameEmpty: "应用名称不能为空",
    deleteConfirm: "确定要删除此规则吗？",
    importConfirm: "将导入新的配置，确定继续？",
    success: "操作成功",
    failed: "操作失败",
    exported: "配置已导出",
    importResult: "导入完成: {imported} 成功, {failed} 失败",
    cpuOptions: {
      "1": "空闲 (1)",
      "2": "正常 (2)",
      "3": "高 (3) - 推荐游戏",
      "4": "实时 (4) - 谨慎",
      "5": "低于正常 (5)",
      "6": "高于正常 (6)",
    },
    ioOptions: {
      "0": "非常低 (0)",
      "1": "低 (1)",
      "2": "正常 (2)",
      "3": "高 (3) - 推荐游戏",
    },
  },
  en: {
    title: "Application CPU / I/O Priority",
    subtitle: "Permanently set application priority via Windows Registry",
    add: "Add App",
    edit: "Edit",
    delete: "Delete",
    refresh: "Refresh",
    export: "Export Config",
    import: "Import Config",
    name: "App Name",
    cpu: "CPU Priority",
    io: "I/O Priority",
    noRules: "No configured applications",
    addDialog: "Add Application Priority",
    editDialog: "Edit Application Priority",
    nameLabel: "App Name (exe)",
    cpuLabel: "CPU Priority",
    ioLabel: "I/O Priority",
    ioEnable: "Enable I/O Priority",
    save: "Save",
    cancel: "Cancel",
    nameEmpty: "App name cannot be empty",
    deleteConfirm: "Delete this rule?",
    importConfirm: "Import new configuration?",
    success: "Operation successful",
    failed: "Operation failed",
    exported: "Config exported",
    importResult: "Import done: {imported} success, {failed} failed",
    cpuOptions: {
      "1": "Idle (1)",
      "2": "Normal (2)",
      "3": "High (3) - Gaming",
      "4": "Realtime (4) - Caution",
      "5": "Below Normal (5)",
      "6": "Above Normal (6)",
    },
    ioOptions: {
      "0": "Very Low (0)",
      "1": "Low (1)",
      "2": "Normal (2)",
      "3": "High (3) - Gaming",
    },
  },
};

const cpuLabelMap: Record<string, string> = {
  "1": "Idle", "2": "Normal", "3": "High",
  "4": "Realtime", "5": "Below Normal", "6": "Above Normal", "-": "-",
};
const ioLabelMap: Record<string, string> = {
  "0": "Very Low", "1": "Low", "2": "Normal", "3": "High", "-": "-",
};


/* Custom dropdown with glass styling */
const SelectDropdown = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Record<string, string>;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [open]);

  const entries = Object.entries(options);
  const selectedLabel = options[value] ?? entries[0]?.[1] ?? "";

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <div
        onClick={() => setOpen(!open)}
        className="input-field"
        style={{
          paddingRight: 32, cursor: "pointer",
          display: "flex", alignItems: "center",
          userSelect: "none",
        }}
      >
        <span style={{ flex: 1 }}>{selectedLabel}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          style={{ position: "absolute", right: 12, top: "50%", marginTop: -3 }}
          width="10" height="6" viewBox="0 0 10 6" fill="none"
        >
          <path d="M1 1L5 5L9 1" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </div>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.96 }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 200,
            background: "var(--bg-glass)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--border-color)",
            borderRadius: 12,
            boxShadow: "0 12px 40px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(255,255,255,0.06) inset",
            padding: "6px 0",
            overflow: "hidden",
          }}
        >
          {entries.map(([k, v], i) => (
            <div
              key={k}
              onClick={() => { onChange(k); setOpen(false); }}
              style={{
                padding: "9px 14px",
                fontSize: 13,
                color: k === value ? "var(--accent)" : "var(--text-primary)",
                background: k === value ? "var(--accent-bg)" : "transparent",
                cursor: "pointer",
                transition: "background 0.15s ease",
                fontWeight: k === value ? 500 : 400,
              }}
              onMouseEnter={(e) => {
                if (k !== value) (e.currentTarget as HTMLElement).style.background = "var(--bg-tertiary)";
              }}
              onMouseLeave={(e) => {
                if (k !== value) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {v}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default function AppCpuPriority(_props: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [rules, setRules] = useState<PriorityRule[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<PriorityRule | null>(null);
  const [formName, setFormName] = useState("");
  const [formCpu, setFormCpu] = useState("3");
  const [formIo, setFormIo] = useState("");
  const [enableIo, setEnableIo] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchRules = useCallback(async () => {
    try {
      const result = await window.electronAPI?.python.call("priority.list");
      if (result && !result.error) setRules(result.applications ?? []);
    } catch { /* bridge not ready, will retry */ }
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const openDialog = (rule?: PriorityRule) => {
    if (rule) {
      setEditTarget(rule);
      setFormName(rule.name);
      setFormCpu(rule.cpu_priority === "-" ? "3" : rule.cpu_priority);
      const ioVal = rule.io_priority;
      if (ioVal && ioVal !== "-") { setFormIo(ioVal); setEnableIo(true); }
      else { setFormIo(""); setEnableIo(false); }
    } else {
      setEditTarget(null);
      setFormName("");
      setFormCpu("3");
      setFormIo("");
      setEnableIo(false);
    }
    setShowDialog(true);
  };

  const saveRule = async () => {
    if (!formName.trim()) { showToast(tx.nameEmpty, "warning"); return; }
    setSaving(true);
    try {
      const method = editTarget ? "priority.edit" : "priority.add";
      const result = await window.electronAPI?.python.call(method, {
        name: formName.trim(),
        cpu_priority: parseInt(formCpu),
        io_priority: enableIo && formIo ? parseInt(formIo) : null,
      });
      setSaving(false);
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        showToast(tx.success, "success");
        recordActivity("appcpu", `${editTarget ? (lang === "zh" ? "编辑" : "Edited") : (lang === "zh" ? "添加" : "Added")} ${formName.trim()}`);
        setShowDialog(false);
        fetchRules();
      }
    } catch (e: any) {
      setSaving(false);
      showToast(e?.message ?? tx.failed, "error");
    }
  };

  const deleteRule = async (rule: PriorityRule) => {
    const ok = await confirm({ title: tx.deleteConfirm, danger: true });
        if (!ok) return;
    try {
      const result = await window.electronAPI?.python.call("priority.delete", { name: rule.name });
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        recordActivity("appcpu", `${lang === "zh" ? "删除" : "Deleted"} ${rule.name}`);
        fetchRules();
      }
    } catch (e: any) {
      showToast(e?.message ?? tx.failed, "error");
    }
  };

  const exportConfig = async () => {
    try {
      const dest = await window.electronAPI?.dialog.saveFile({
        defaultPath: "AppCpuPriority_export.json",
        filters: [{ name: "JSON Files", extensions: ["json"] }],
      });
      if (!dest) return;
      const result = await window.electronAPI?.python.call("priority.export", { filepath: dest });
      if (result?.success) {
        showToast(tx.exported, "success");
      } else {
        showToast(result?.error ?? tx.failed, "error");
      }
    } catch (e: any) {
      showToast(e?.message ?? tx.failed, "error");
    }
  };

  const importConfig = async () => {
    try {
      const ok = await confirm({ title: tx.importConfirm, danger: false });
      if (!ok) return;
      const filepath = await window.electronAPI?.dialog.openFile({
        name: "JSON Files", extensions: ["json"],
      });
      if (!filepath) return;
      const result = await window.electronAPI?.python.call("priority.import_config", { filepath });
      if (result && !result.error) {
        const msg = tx.importResult
          .replace("{imported}", String(result.imported ?? 0))
          .replace("{failed}", String(result.failed ?? 0));
        showToast(msg, "success");
        fetchRules();
      } else {
        showToast(result?.error ?? tx.failed, "error");
      }
    } catch (e: any) {
      showToast(e?.message ?? tx.failed, "error");
    }
  };
  const { settings } = useTheme();
  const animationDuration = getAnimDuration(settings.animationSpeed);


  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: animationDuration, ease: EASE_OUT }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{tx.title}</h2>
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "4px 0 0" }}>{tx.subtitle}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <GlassButton variant="primary" onClick={() => openDialog()} style={{ padding: "8px 16px", fontSize: 13 }}>
            <Plus size={14} /> {tx.add}
          </GlassButton>
          <GlassButton variant="secondary" onClick={fetchRules} style={{ padding: "8px 12px", fontSize: 13 }}>
            <RefreshCw size={14} />
          </GlassButton>
          <GlassButton variant="secondary" onClick={exportConfig} style={{ padding: "8px 14px", fontSize: 13 }}>
            <Download size={14} /> {tx.export}
          </GlassButton>
          <GlassButton variant="secondary" onClick={importConfig} style={{ padding: "8px 14px", fontSize: 13 }}>
            <Upload size={14} /> {tx.import}
          </GlassButton>
        </div>
      </div>

      {/* Table */}
      {rules.length === 0 ? (
        <GlassCard style={{ padding: "48px 24px", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} transition={{ duration: animationDuration, ease: EASE_OUT }} />
          <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{tx.noRules}</div>
        </GlassCard>
      ) : (
        <GlassCard style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 500, color: "var(--text-tertiary)", textTransform: "uppercase" }}>{tx.name}</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 500, color: "var(--text-tertiary)", textTransform: "uppercase" }}>{tx.cpu}</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 500, color: "var(--text-tertiary)", textTransform: "uppercase" }}>{tx.io}</th>
                <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 11, fontWeight: 500, color: "var(--text-tertiary)", textTransform: "uppercase" }}></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.name} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{rule.name}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13, color: "var(--text-secondary)" }}>
                    {cpuLabelMap[rule.cpu_priority] ?? rule.cpu_priority}
                  </td>
                  <td style={{ padding: "10px 16px", fontSize: 13, color: "var(--text-secondary)" }}>
                    {ioLabelMap[rule.io_priority] ?? rule.io_priority}
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right" }}>
                    <button className="btn-icon" onClick={() => openDialog(rule)}><Pencil size={12} /></button>
                    <button className="btn-icon" onClick={() => deleteRule(rule)} style={{ color: "var(--danger)" }}><Trash2 size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      {/* Dialog */}
      <AnimatePresence>
      {showDialog && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animationDuration, ease: EASE_OUT }}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
            onClick={() => setShowDialog(false)}
          />
          {/* Dialog panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 320, mass: 0.9 }}
            style={{
              position: "fixed", inset: 0, zIndex: 101,
              display: "flex", alignItems: "center", justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                pointerEvents: "auto",
                width: 420, maxWidth: "calc(100vw - 40px)",
                background: "var(--bg-glass)",
                borderRadius: 20,
                border: "1px solid var(--border-color)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.08) inset",
                padding: 28,
              }}
            >
              {/* Title */}
              <h3 style={{
                fontSize: 17, fontWeight: 600,
                color: "var(--text-primary)",
                margin: "0 0 20px 0",
                letterSpacing: "-0.01em",
              }}>
                {editTarget ? tx.editDialog : tx.addDialog}
              </h3>

              {/* Form fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* App name */}
                <div>
                  <label style={{
                    fontSize: 11, fontWeight: 500,
                    color: "var(--text-tertiary)",
                    display: "block", marginBottom: 6,
                    textTransform: "uppercase", letterSpacing: "0.04em",
                  }}>{tx.nameLabel}</label>
                  <input
                    className="input-field"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="example.exe"
                    autoFocus
                  />
                </div>

                {/* CPU Priority */}
                <div>
                  <label style={{
                    fontSize: 11, fontWeight: 500,
                    color: "var(--text-tertiary)",
                    display: "block", marginBottom: 6,
                    textTransform: "uppercase", letterSpacing: "0.04em",
                  }}>{tx.cpuLabel}</label>
                  <SelectDropdown
                    value={formCpu}
                    onChange={setFormCpu}
                    options={tx.cpuOptions}
                  />
                </div>

                {/* I/O Priority toggle */}
                <div>
                  <div
                    onClick={() => setEnableIo(!enableIo)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      cursor: "pointer", userSelect: "none",
                    }}
                  >
                    <div style={{
                      width: 38, height: 22, borderRadius: 11,
                      background: enableIo ? "var(--accent)" : "var(--bg-tertiary)",
                      border: enableIo ? "none" : "1px solid var(--border-color)",
                      position: "relative",
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                    }}>
                      <motion.div
                        animate={{ left: enableIo ? 18 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        style={{
                          position: "absolute", top: 2,
                          width: 18, height: 18, borderRadius: "50%",
                          background: "white",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{tx.ioEnable}</span>
                  </div>
                  {enableIo && (
                    <div style={{ marginTop: 10 }}>
                      <SelectDropdown
                        value={formIo}
                        onChange={setFormIo}
                        options={tx.ioOptions}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24,
              }}>
                <button
                  className="btn-secondary"
                  onClick={() => setShowDialog(false)}
                  disabled={saving}
                >{tx.cancel}</button>
                <button
                  className="btn-primary"
                  onClick={saveRule}
                  disabled={saving}
                >{tx.save}</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>    </motion.div>
  );
}
