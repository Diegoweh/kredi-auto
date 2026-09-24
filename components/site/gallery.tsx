"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, ExpandIcon } from "@/components/icons";

interface GalleryProps {
  photos: string[];
  alt: string;
}

/** Swipeable photo gallery (native scroll-snap) with thumbnails and a fullscreen view. */
export function Gallery({ photos, alt }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fullTrackRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback((track: HTMLElement | null, i: number, smooth = true) => {
    if (!track) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: smooth ? "smooth" : "instant" });
  }, []);

  const onScroll = (track: HTMLDivElement) => {
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== index) setIndex(i);
  };

  // Keep the active thumbnail visible.
  useEffect(() => {
    const thumb = thumbsRef.current?.children[index] as HTMLElement | undefined;
    thumb?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [index]);

  function openFullscreen() {
    dialogRef.current?.showModal();
    requestAnimationFrame(() => scrollTo(fullTrackRef.current, index, false));
  }

  function onDialogClose() {
    scrollTo(trackRef.current, index, false);
  }

  const go = (track: HTMLElement | null, delta: number) =>
    scrollTo(track, Math.max(0, Math.min(photos.length - 1, index + delta)));

  if (!photos.length) {
    return <div className="grid aspect-[4/3] place-items-center rounded-xl bg-paper text-muted">Sin fotos</div>;
  }

  return (
    <div>
      <div className="group relative -mx-4 sm:mx-0">
        <div
          ref={trackRef}
          onScroll={(e) => onScroll(e.currentTarget)}
          className="scrollbar-none flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto bg-paper sm:rounded-xl"
          aria-roledescription="carrusel"
          aria-label={`Fotos de ${alt}`}
        >
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={openFullscreen}
              className="relative h-full w-full shrink-0 snap-center cursor-zoom-in"
              aria-label={`Ver foto ${i + 1} de ${photos.length} en pantalla completa`}
            >
              <Image
                src={src}
                alt={`${alt}, foto ${i + 1}`}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                preload={i === 0}
                loading={i === 0 ? undefined : "lazy"}
                className="object-cover"
              />
            </button>
          ))}
        </div>

        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white tabular-nums sm:left-4">
          {index + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={openFullscreen}
          aria-label="Pantalla completa"
          className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-black/60 text-white sm:right-4"
        >
          <ExpandIcon width={18} height={18} />
        </button>

        {photos.length > 1 && (
          <>
            <NavButton side="left" disabled={index === 0} onClick={() => go(trackRef.current, -1)} />
            <NavButton side="right" disabled={index === photos.length - 1} onClick={() => go(trackRef.current, 1)} />
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div ref={thumbsRef} className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => scrollTo(trackRef.current, i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === index}
              className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-md opacity-55 ring-brand transition hover:opacity-100 aria-[current=true]:opacity-100 aria-[current=true]:ring-2 sm:w-24"
            >
              <Image src={src} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <dialog
        ref={dialogRef}
        onClose={onDialogClose}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(fullTrackRef.current, 1);
          if (e.key === "ArrowLeft") go(fullTrackRef.current, -1);
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-black p-0 text-white backdrop:bg-black"
        aria-label={`Fotos de ${alt}`}
      >
        <div
          ref={fullTrackRef}
          onScroll={(e) => onScroll(e.currentTarget)}
          className="scrollbar-none flex h-full snap-x snap-mandatory overflow-x-auto"
        >
          {photos.map((src, i) => (
            <div key={src} className="relative h-full w-full shrink-0 snap-center">
              <Image src={src} alt={`${alt}, foto ${i + 1}`} fill sizes="100vw" className="object-contain" />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <span className="text-sm tabular-nums">
            {index + 1} / {photos.length}
          </span>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar"
            className="grid size-11 place-items-center rounded-full bg-white/10"
            autoFocus
          >
            <CloseIcon width={24} height={24} />
          </button>
        </div>
        {photos.length > 1 && (
          <>
            <NavButton side="left" dark disabled={index === 0} onClick={() => go(fullTrackRef.current, -1)} />
            <NavButton side="right" dark disabled={index === photos.length - 1} onClick={() => go(fullTrackRef.current, 1)} />
          </>
        )}
      </dialog>
    </div>
  );
}

function NavButton({
  side,
  disabled,
  onClick,
  dark,
}: {
  side: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  dark?: boolean;
}) {
  const Icon = side === "left" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Foto anterior" : "Foto siguiente"}
      className={`absolute top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full shadow-sm transition disabled:opacity-0 sm:grid ${
        side === "left" ? "left-4" : "right-4"
      } ${dark ? "bg-white/10 text-white hover:bg-white/20" : "bg-white/90 text-ink opacity-0 group-hover:opacity-100 hover:bg-white"}`}
    >
      <Icon width={22} height={22} />
    </button>
  );
}
