import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/appwrite/server";
import { getCarByIdAdmin } from "@/lib/cars";
import { carName } from "@/lib/car-types";
import { CarForm } from "@/components/admin/car-form";

export const metadata = { title: "Editar auto" };

export default async function EditCarPage({ params }: PageProps<"/admin/autos/[id]">) {
  await requireAdmin();
  const car = await getCarByIdAdmin((await params).id);
  if (!car) notFound();
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">
        Editar {carName(car)} {car.year}
      </h1>
      <CarForm car={car} />
    </>
  );
}
