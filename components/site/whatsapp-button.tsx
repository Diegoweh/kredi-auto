import { WhatsAppIcon } from "@/components/icons";
import { whatsappLink } from "@/lib/whatsapp";

interface WhatsAppButtonProps {
  message: string;
  children: React.ReactNode;
  className?: string;
}

export function WhatsAppButton({ message, children, className = "" }: WhatsAppButtonProps) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2.5 rounded-full bg-whatsapp px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-whatsapp-700 active:scale-[0.99] ${className}`}
    >
      <WhatsAppIcon width={22} height={22} />
      {children}
    </a>
  );
}
