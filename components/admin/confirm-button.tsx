"use client";

import { useTransition } from "react";

interface ConfirmButtonProps {
  action: () => Promise<void>;
  confirmText: string;
  children: React.ReactNode;
  className?: string;
}

export function ConfirmButton({ action, confirmText, children, className = "" }: ConfirmButtonProps) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(confirmText)) startTransition(action);
      }}
      className={`disabled:opacity-50 ${className}`}
    >
      {pending ? "…" : children}
    </button>
  );
}
