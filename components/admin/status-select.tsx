"use client";

import { useTransition } from "react";
import { setCarStatus } from "@/app/actions/cars";
import { CAR_STATUSES, statusLabel, type CarStatus } from "@/lib/car-types";

const style: Record<CarStatus, string> = {
  disponible: "bg-accent/15 text-accent-600",
  apartado: "bg-amber-100 text-amber-800",
  vendido: "bg-line text-muted",
};

export function StatusSelect({ id, status }: { id: string; status: CarStatus }) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      aria-label="Estado"
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as CarStatus;
        startTransition(() => setCarStatus(id, next));
      }}
      className={`cursor-pointer rounded-full border-0 py-0.5 pr-7 pl-2.5 text-xs font-semibold disabled:opacity-50 ${style[status]}`}
    >
      {CAR_STATUSES.map((s) => (
        <option key={s} value={s}>
          {statusLabel[s]}
        </option>
      ))}
    </select>
  );
}
