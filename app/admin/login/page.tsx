import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/site/logo";

export const metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <main className="grid flex-1 place-items-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Logo className="h-7 w-auto" />
        <h1 className="mt-8 text-2xl font-bold tracking-tight">Panel de administración</h1>
        <p className="mt-1 text-sm text-muted">Inicia sesión para administrar el inventario.</p>
        <LoginForm />
      </div>
    </main>
  );
}
