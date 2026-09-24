import Image from "next/image";
import { carPhotoUrl } from "@/lib/appwrite/config";

interface CarPhotoProps {
  fileId: string | undefined;
  alt: string;
  sizes: string;
  className?: string;
  preload?: boolean;
}

/** Cover photo that fills its (relatively positioned) parent. */
export function CarPhoto({ fileId, alt, sizes, className = "", preload }: CarPhotoProps) {
  if (!fileId) {
    return (
      <div className={`absolute inset-0 grid place-items-center bg-paper text-xs text-muted ${className}`}>
        Sin foto
      </div>
    );
  }
  return (
    <Image
      src={carPhotoUrl(fileId)}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      className={`object-cover ${className}`}
    />
  );
}
