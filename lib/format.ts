const numberFmt = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 });

export const formatNumber = (n: number) => numberFmt.format(n);
export const formatPrice = (n: number) => `$${numberFmt.format(n)}`;
export const formatKm = (n: number) => `${numberFmt.format(n)} km`;

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso),
  );
