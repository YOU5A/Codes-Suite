import React, { createContext, useContext, useState, useCallback, useRef } from "react";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export interface PendingConfirm extends ConfirmOptions {
  id: number;
}

interface ConfirmContextValue {
  pending: PendingConfirm | null;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

const ConfirmContext = createContext<ConfirmContextValue>({
  pending: null,
  confirm: () => Promise.resolve(false),
  handleConfirm: () => {},
  handleCancel: () => {},
});

export function useConfirm() {
  return useContext(ConfirmContext);
}

let nextId = 1;

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setPending({ ...options, id: nextId++ });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    resolveRef.current = null;
    setPending(null);
  }, []);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setPending(null);
  }, []);

  return (
    <ConfirmContext.Provider value={{ pending, confirm, handleConfirm, handleCancel }}>
      {children}
    </ConfirmContext.Provider>
  );
}
