import { useState, useEffect, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "./hooks/useTheme";
import { getAnimDuration, EASE_OUT } from "./utils/animations";
import { ToastProvider } from "./contexts/ToastContext";
import { ConfirmProvider } from "./contexts/ConfirmContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import ToastContainer from "./components/Toast";
import ConfirmDialog from "./components/ConfirmDialog";
import type { Page } from "./types";
import TitleBar from "./components/TitleBar";
import Sidebar from "./components/Sidebar";

// Lazy-loaded pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Win32Priority = lazy(() => import("./pages/Win32Priority"));
const AppCpuPriority = lazy(() => import("./pages/AppCpuPriority"));
const MusicManager = lazy(() => import("./pages/MusicManager"));
const BackupCenter = lazy(() => import("./pages/BackupCenter"));
const Settings = lazy(() => import("./pages/Settings"));

function PageLoader() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100%", minHeight: 200,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        border: "3px solid var(--border-color)",
        borderTopColor: "var(--accent)",
        animation: "spin 0.6s linear infinite",
      }} />
    </div>
  );
}

function AppContent() {
  const { theme, resolvedTheme, settings, setTheme, updateSettings } = useTheme();
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    return (localStorage.getItem("codes-suite-page") as Page) || "dashboard";
  });
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    window.electronAPI?.window.onMaximizeChange(setIsMaximized);
    window.electronAPI?.window.isMaximized().then(setIsMaximized);
  }, []);

  // Apply window opacity on mount and when settings change
  useEffect(() => {
    window.electronAPI?.window.setOpacity(settings.windowOpacity / 100);
  }, [settings.windowOpacity]);

  // Save current page
  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    localStorage.setItem("codes-suite-page", page);
  };

  const pages: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard onNavigate={handleNavigate} />,
    win32priority: <Win32Priority />,
    appcpupriority: <AppCpuPriority />,
    musicmanager: <MusicManager />,
    backupcenter: <BackupCenter />,
    settings: <Settings />,
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div className="app-root">
      <div style={{ position: "relative", zIndex: 1 }}>
        <TitleBar
          isMaximized={isMaximized}
          onToggleMaximize={() => window.electronAPI?.window.maximize()}
        />
      </div>
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative", zIndex: 1 }}>
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />
        <main
          style={{
            flex: 1,
            overflow: "auto",
            padding: settings.compactMode ? "16px" : "24px",
            background: "var(--bg-primary)",
            zoom: `var(--font-scale)`,
          }}
        >
          <Suspense fallback={<PageLoader />}>
          {settings.animationSpeed === "off" ? (
            <div style={{ height: "100%" }}>{pages[currentPage]}</div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: getAnimDuration(settings.animationSpeed), ease: EASE_OUT }}
                style={{ height: "100%" }}
              >
                {pages[currentPage]}
              </motion.div>
            </AnimatePresence>
          )}
          </Suspense>
        </main>
      </div>
      <ToastContainer />
      <ConfirmDialog />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}