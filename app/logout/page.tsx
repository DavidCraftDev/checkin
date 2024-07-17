"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function Logout() {
  const router = useRouter()
  useEffect(() => {
    signOut({ redirect: false }).then(() => {
      router.push("/login");
    });
  }, [router]);
  return null;
}

export default Logout;