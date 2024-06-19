import { getSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default async function start() {
  const session = await getSession();
  if(!session) {
    return redirect("/login");
  }
  redirect("/dashboard");
}
