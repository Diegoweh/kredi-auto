import { site } from "./site";
import { carFullName, fuelLabel, transmissionLabel, type Car } from "./car-types";
import { formatKm, formatPrice } from "./format";

export function whatsappLink(message: string, number: string = site.whatsappNumber) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** e.g. "Hola, me interesa el Toyota Corolla LE 2020, 45,000 km, automática, … $250,000 MXN. ¿Sigue disponible?" */
export function carInterestMessage(car: Car) {
  const details = [
    `${carFullName(car)} ${car.year}`,
    formatKm(car.mileage),
    car.transmission && transmissionLabel[car.transmission].toLowerCase(),
    car.fuelType && fuelLabel[car.fuelType].toLowerCase(),
    car.color && `color ${car.color.toLowerCase()}`,
    `${formatPrice(car.price)} MXN`,
  ].filter(Boolean);
  return [
    `Hola, me interesa el ${details.join(", ")}. ¿Sigue disponible?`,
    `${site.url}/autos/${car.slug}`,
  ].join("\n\n");
}
