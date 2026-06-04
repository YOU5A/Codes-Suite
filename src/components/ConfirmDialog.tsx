import { motion, AnimatePresence } from "framer-motion";
import { EASE_OUT } from "@/utils/animations";
import { AlertTriangle } from "lucide-react";
import { useConfirm } from "@/contexts/ConfirmContext";
import { useLanguage } from "@/contexts/LanguageContext";

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
    <AnimatePresence>
      {isOpen && pending && (
        <motion.div
          key={"confirm-" + pending.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: EASE_OUT }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          onClick={handleCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.15, ease: EASE_OUT }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 400,
              maxWidth: "calc(100vw - 48px)",
              background: "var(--bg-glass, rgba(255,255,255,0.75))",
              backdropFilter: "blur(30px) saturate(180%)",
              WebkitBackdropFilter: "blur(30px) saturate(180%)",
              borderRadius: 20,
              border: "1px solid var(--border-color, rgba(255,255,255,0.18))",
              boxShadow: "0 24px 64px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(255,255,255,0.1) inset",
              padding: "28px 28px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              {pending.danger && (
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "rgba(231,76,60,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <AlertTriangle size={20} style={{ color: "var(--danger, #e74c3c)" }} />
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
              <button
                className="btn-secondary"
                onClick={handleCancel}
                style={{ padding: "8px 20px", fontSize: 13 }}
                autoFocus
              >
                {pending.cancelLabel ?? labels.cancel}
              </button>
              <button
                className={pending.danger ? "btn-danger" : "btn-primary"}
                onClick={handleConfirm}
                style={{ padding: "8px 20px", fontSize: 13 }}
              >
                {pending.confirmLabel ?? labels.confirm}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}