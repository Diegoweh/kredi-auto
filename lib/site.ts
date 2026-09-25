export const site = {
  name: "Kredi Auto",
  city: "Mazatlán, Sinaloa",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  whatsappNumber: "5216691101007",
  phoneDisplay: "669 110 1007",
  phoneHref: "tel:+526691101007",
  mapsUrl: "https://maps.app.goo.gl/SkkjQohGBD5deLmk6",
  mapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m12!1m8!1m3!1d29329.825689776666!2d-106.44367096635328!3d23.23478117371085!3m2!1i1024!2i768!4f13.1!2m1!1skrediauto%20mazatlan!5e0!3m2!1ses-419!2smx!4v1790364797244!5m2!1ses-419!2smx",
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
