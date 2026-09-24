import { requireAdmin } from "@/lib/appwrite/server";
import { CarForm } from "@/components/admin/car-form";

export const metadata = { title: "Agregar auto" };

export default async function NewCarPage() {
  await requireAdmin();
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Agregar auto</h1>
      <CarForm car={null} />
    </>
  );
}
