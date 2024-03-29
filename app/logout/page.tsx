import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default async function SignOut() {
  useEffect(() => {
    signOut();
    redirect("/api/auth/signin")
  })
}
