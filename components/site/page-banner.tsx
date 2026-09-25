import Image from "next/image";

interface PageBannerProps {
  src: string;
  children: React.ReactNode;
  /** CSS object-position for the photo, to keep its subject in view when cropped. */
  position?: string;
}

/** Full-bleed photo header with the page title over a dark gradient. The photo is decorative. */
export function PageBanner({ src, children, position = "center" }: PageBannerProps) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <Image
        src={src}
        alt=""
        fill
        preload
        sizes="100vw"
        className="-z-10 object-cover"
        style={{ objectPosition: position }}
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/60 to-ink/30 md:bg-gradient-to-r md:from-ink/90 md:via-ink/60 md:to-ink/10"
        aria-hidden
      />
      <div className="mx-auto flex min-h-[22rem] max-w-6xl flex-col justify-end px-4 pt-16 pb-10 sm:px-6 md:min-h-[26rem] md:justify-center lg:min-h-[30rem]">
        <div className="max-w-2xl animate-rise">{children}</div>
      </div>
    </section>
  );
}
