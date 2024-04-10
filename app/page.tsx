"use client";

import { getSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function start() {
  getSession();
  redirect("/dashboard");
}
