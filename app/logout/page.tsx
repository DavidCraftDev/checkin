import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export default async function SignOut() {
  signOut();
  redirect("/api/auth/signin")
}
