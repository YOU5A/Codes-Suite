import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { useToast, type ToastType } from "@/contexts/ToastContext";
import { glassEntrance } from "@/design-system";

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={16} />,
  error: <XCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />,
};

const colorMap: Record<ToastType, string> = {
  success: "var(--success)",
  error: "var(--danger)",
  warning: "var(--warning)",
  info: "var(--accent)",
};

export default function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div
      style={{
        position: "fixed",
        top: 56,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            variants={glassEntrance}
            initial="hidden"
            animate={toast.exiting ? "exit" : "visible"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              borderRadius: 12,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-strong)",
              boxShadow: "var(--shadow-lg)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              minWidth: 240,
              maxWidth: 400,
              pointerEvents: "auto",
              fontSize: 13,
              color: "var(--text-primary)",
            }}
          >
            <span style={{ color: colorMap[toast.type], flexShrink: 0 }}>
              {iconMap[toast.type]}
            </span>
            <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}