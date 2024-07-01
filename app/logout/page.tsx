"use client";

import { signOut } from "next-auth/react";

export default function Logout() {
  "use client";
  signOut({ callbackUrl: window.location.hostname + "/login", redirect: true});
}
