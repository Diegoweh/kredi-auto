export const site = {
  name: "Kredi Auto",
  city: "Mazatlán, Sinaloa",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  whatsappNumber: "5216691101007",
  phoneDisplay: "669 110 1007",
  phoneHref: "tel:+526691101007",
  mapsUrl: "https://maps.app.goo.gl/SkkjQohGBD5deLmk6",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=krediauto+mazatlan&ll=23.2347826,-106.4282212&z=16&output=embed",
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61550311362989",
    instagram: "https://www.instagram.com/krediautomazatlan",
  },
} as const;

export const nav = [
  { href: "/autos", label: "Autos" },
  { href: "/vende-tu-auto", label: "Vende tu auto" },
  { href: "/contacto", label: "Contacto" },
] as const;
