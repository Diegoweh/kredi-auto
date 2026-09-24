import Image from "next/image";
import Link from "next/link";
import logo from "@/public/kredi-logo.svg";

export function Logo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Kredi Auto, inicio" className="shrink-0">
      <Image src={logo} alt="Kredi Auto" className={className} preload />
    </Link>
  );
}
