import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Account, Client, Storage, TablesDB, Users } from "node-appwrite";
import {
  ADMIN_LABEL,
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  SESSION_COOKIE,
} from "./config";

function baseClient() {
  return new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
}

/** Client authenticated with the server API key. Never expose to the browser. */
export function createAdminClient() {
  const client = baseClient().setKey(process.env.APPWRITE_API_KEY ?? "");
  return {
    account: new Account(client),
    tables: new TablesDB(client),
    storage: new Storage(client),
    users: new Users(client),
  };
}

function createSessionClient(secret: string) {
  const client = baseClient().setSession(secret);
  return { account: new Account(client) };
}

/** Returns the logged-in admin user, or null. */
export async function getAdmin() {
  const secret = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!secret) return null;
  try {
    const user = await createSessionClient(secret).account.get();
    return user.labels.includes(ADMIN_LABEL) ? user : null;
  } catch {
    return null;
  }
}

/** Use at the top of every admin page and admin server action. */
export async function requireAdmin() {
  const user = await getAdmin();
  if (!user) redirect("/admin/login");
  return user;
}
