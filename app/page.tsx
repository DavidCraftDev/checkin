import { redirect } from "next/navigation";
import { getCurrentSession } from "./src/modules/auth/cookieManager";

export default async function start() {
  const { session } = await getCurrentSession();
  if(!session) return redirect("/login");
  redirect("/dashboard");
}
