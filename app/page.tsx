"use client";

import { getSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Home() {
  getSession();
  redirect("/dashboard");
}
