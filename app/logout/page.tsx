"use client";

import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Logout() {
  const { data: session } = useSession()
  if (session == null) redirect("/login")
  useEffect(() => {
    signOut({ redirect: false });
    redirect("/login");
  }, []);
}
