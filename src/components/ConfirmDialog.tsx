import { AlertTriangle } from "lucide-react";
import { useConfirm } from "@/contexts/ConfirmContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { GlassModal, GlassButton } from "@/design-system";

const btnLabels = {
  zh: { confirm: "\u786e\u5b9a", cancel: "\u53d6\u6d88" },
  en: { confirm: "Confirm", cancel: "Cancel" },
};

export default function ConfirmDialog() {
  const { pending, handleConfirm, handleCancel } = useConfirm();
  const { lang } = useLanguage();
  const labels = btnLabels[lang];

  const isOpen = pending !== null;

  return (
    <GlassModal open={isOpen} onClose={handleCancel} maxWidth={400}>
      {pending && (
        <>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            {pending.danger && (
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "rgba(231,76,60,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <AlertTriangle size={20} style={{ color: "var(--danger)" }} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                fontSize: 16, fontWeight: 600, color: "var(--text-primary)",
                margin: 0, lineHeight: 1.3, letterSpacing: "-0.01em",
              }}>
                {pending.title}
              </h3>
              {pending.description && (
                <p style={{
                  fontSize: 13, color: "var(--text-secondary)",
                  margin: "6px 0 0", lineHeight: 1.5,
                }}>
                  {pending.description}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={handleCancel}
              autoFocus
            >
              {pending.cancelLabel ?? labels.cancel}
            </GlassButton>
            <GlassButton
              variant={pending.danger ? "danger" : "primary"}
              size="sm"
              onClick={handleConfirm}
            >
              {pending.confirmLabel ?? labels.confirm}
            </GlassButton>
          </div>
        </>
      )}
    </GlassModal>
  );
}
