"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";
import { FormField } from "@/components/site/form-field";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {} as LoginState);
  return (
    <form action={action} className="mt-8 space-y-5">
      <FormField label="Correo" name="email" type="email" autoComplete="email" required />
      <FormField label="Contraseña" name="password" type="password" autoComplete="current-password" required />
      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ink py-3.5 font-semibold text-white transition-opacity disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
