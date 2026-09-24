"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Account, Client } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import { ADMIN_LABEL, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, SESSION_COOKIE } from "@/lib/appwrite/config";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Escribe tu correo y contraseña." };

  const { account, users } = createAdminClient();
  let session;
  try {
    session = await account.createEmailPasswordSession({ email, password });
  } catch {
    return { error: "Correo o contraseña incorrectos." };
  }

  const user = await users.get({ userId: session.userId });
  if (!user.labels.includes(ADMIN_LABEL)) {
    await users.deleteSession({ userId: session.userId, sessionId: session.$id });
    return { error: "Esta cuenta no tiene acceso al panel." };
  }

  (await cookies()).set(SESSION_COOKIE, session.secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(session.expire),
  });
  redirect("/admin/autos");
}

export async function logout() {
  const store = await cookies();
  const secret = store.get(SESSION_COOKIE)?.value;
  if (secret) {
    const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID).setSession(secret);
    await new Account(client).deleteSession({ sessionId: "current" }).catch(() => {});
  }
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
