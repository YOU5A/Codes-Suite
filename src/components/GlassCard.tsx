import { ReactNode } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "@/utils/animations";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function GlassCard({ children, className, onClick, style }: GlassCardProps) {
  return (
    <motion.div
      className={`glass-card ${className ?? ""}`}
      onClick={onClick}
      style={{
        padding: 20,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
