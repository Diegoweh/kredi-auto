import { site } from "@/lib/site";
import { FacebookIcon, InstagramIcon } from "@/components/icons";

const links = [
  { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
  { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
];

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-1 ${className}`}>
      {links.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Kredi Auto en ${label}`}
            className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-paper hover:text-brand-600"
          >
            <Icon />
          </a>
        </li>
      ))}
    </ul>
  );
}
