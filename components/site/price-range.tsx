"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";

interface PriceRangeProps {
  bounds: { min: number; max: number };
  step: number;
  defaultMin?: number;
  defaultMax?: number;
  /** Called when the user releases a thumb (not on every drag tick). */
  onCommit: () => void;
}

const COMMIT_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"]);

/**
 * Two-thumb price slider. The range inputs are unnamed; the values are submitted
 * through hidden `precioMin` / `precioMax` inputs, left empty when a thumb sits at
 * its bound so the URL only carries real filters.
 */
export function PriceRange({ bounds, step, defaultMin, defaultMax, onCommit }: PriceRangeProps) {
  const clamp = (n: number) => Math.min(bounds.max, Math.max(bounds.min, n));
  const [lo, setLo] = useState(() => clamp(defaultMin ?? bounds.min));
  const [hi, setHi] = useState(() => clamp(defaultMax ?? bounds.max));

  const span = bounds.max - bounds.min;
  const pct = (n: number) => ((n - bounds.min) / span) * 100;

  const commitProps = {
    onPointerUp: onCommit,
    onKeyUp: (e: React.KeyboardEvent) => COMMIT_KEYS.has(e.key) && onCommit(),
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm font-semibold tabular-nums" aria-hidden>
        <span>{formatPrice(lo)}</span>
        <span>
          {formatPrice(hi)}
          {hi === bounds.max && "+"}
        </span>
      </div>

      <div className="relative mt-3 h-6">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-line" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          aria-label="Precio mínimo"
          aria-valuetext={formatPrice(lo)}
          min={bounds.min}
          max={bounds.max}
          step={step}
          value={lo}
          // Keep the form's onChange (which applies filters) from firing on every drag tick.
          onChange={(e) => {
            e.stopPropagation();
            setLo(Math.min(Number(e.target.value), hi - step));
          }}
          {...commitProps}
          // When both thumbs meet at the top, the min thumb must stay grabbable.
          className={`range-thumb absolute inset-0 ${lo > bounds.max - step * 2 ? "z-20" : "z-10"}`}
        />
        <input
          type="range"
          aria-label="Precio máximo"
          aria-valuetext={formatPrice(hi)}
          min={bounds.min}
          max={bounds.max}
          step={step}
          value={hi}
          onChange={(e) => {
            e.stopPropagation();
            setHi(Math.max(Number(e.target.value), lo + step));
          }}
          {...commitProps}
          className="range-thumb absolute inset-0 z-10"
        />
      </div>

      <input type="hidden" name="precioMin" value={lo > bounds.min ? lo : ""} />
      <input type="hidden" name="precioMax" value={hi < bounds.max ? hi : ""} />
    </div>
  );
}
