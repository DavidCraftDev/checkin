"use client";

import { signIn } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  async function handleSubmit(e: any) {
    e.preventDefault();
    const formdata: FormData = new FormData(e.target);
    const username = formdata.get("username") as string;
    const password = formdata.get("password") as string;
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    if (result?.ok) {
      router.push("/dashboard");
    } else {
      toast.error("Falscher Nutzername oder Passwort");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nutzername"
          name="username"
        />
        <input
          type="password"
          placeholder="Passwort"
          name="password"
        />
        <button type="submit">Einloggen</button>
      </form>
      <Toaster position="bottom-center" />
    </div>
  );
}