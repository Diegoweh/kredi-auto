"use client";

import { useEffect, useRef, useState } from "react";
import { resizeImage } from "@/lib/resize-image";
import { CloseIcon } from "@/components/icons";

interface PhotoPickerProps {
  onChange: (files: File[]) => void;
  max: number;
  error?: string;
}

/** Lets the user pick photos, resizes them in the browser and shows previews. */
export function PhotoPicker({ onChange, max, error }: PhotoPickerProps) {
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<{ file: File; url: string }[]>([]);

  // Free preview URLs on unmount.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.url)), []);

  function update(next: typeof items) {
    setItems(next);
    onChange(next.map((i) => i.file));
  }

  async function add(list: FileList | null) {
    if (!list?.length) return;
    setBusy(true);
    try {
      const picked = [...list].slice(0, max - items.length);
      const resized = await Promise.all(picked.map((f) => resizeImage(f).catch(() => null)));
      const added = resized.filter((f): f is File => f !== null).map((file) => ({ file, url: URL.createObjectURL(file) }));
      update([...items, ...added]);
    } finally {
      setBusy(false);
    }
  }

  function remove(index: number) {
    URL.revokeObjectURL(items[index].url);
    update(items.filter((_, j) => j !== index));
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold">
        Fotos <span className="font-normal text-muted">(opcional, hasta {max})</span>
      </p>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {items.map(({ url: src }, i) => (
          <li key={src} className="relative aspect-square overflow-hidden rounded-lg bg-paper">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
            <img src={src} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Quitar foto ${i + 1}`}
              className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-black/60 text-white"
            >
              <CloseIcon width={16} height={16} />
            </button>
          </li>
        ))}
        {items.length < max && (
          <li>
            <label className="grid aspect-square cursor-pointer place-items-center rounded-lg border border-dashed border-line text-center text-sm font-medium text-muted transition-colors hover:border-brand hover:text-brand-600 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand">
              <span>{busy ? "Procesando…" : "+ Agregar"}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                disabled={busy}
                onChange={(e) => {
                  add(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </li>
        )}
      </ul>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
