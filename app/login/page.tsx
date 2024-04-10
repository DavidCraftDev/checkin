"use client";

import { signIn } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export default function Login() {
  const router = useRouter();
  let usernameError = false;
  let passwordError = false;
  let errorCount = 0;
  let disabled = false;

  async function handleSubmit(data: any) {
    if (disabled) return;
    disabled = true;
    const username = data.get("username") as string;
    const password = data.get("password") as string;
    usernameError = false;
    passwordError = false;
    if (!username) {
      usernameError = true
      toast.error("Bitte einen Nutzernamen eingeben")
      disabled = false;
      return
    } else if (!password) {
      passwordError = true
      toast.error("Bitte ein Passwort eingeben")
      disabled = false;
      return
    }
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    if (result?.ok) {
      router.push("/dashboard");
    } else {
      toast.error("Falscher Nutzername oder Passwort");
      errorCount++;
      disabled = false;
      if (errorCount >= 10) {
        router.push("https://youtu.be/GHMjD0Lp5DY");
      }
    }
  }
  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <form action={handleSubmit} className="p-4 bg-white rounded-lg shadow-md">
        <div className="mb-2 flex h-20 items-end justify-start rounded-md bg-green-600 p-4 md:h-40">
          <div className="w-32 text-white md:w-40">
            CheckIN
          </div>
        </div>
        <div className="flex flex-col space-y-4">
          <h1>Einlogen</h1>
          <label htmlFor="username" className="font-bold text-gray-600">Nutzername</label>
          <input type="text" name="username" id="username" placeholder="vorname.nachname" className={clsx("rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1", { "border-red-600 ring-red-600": usernameError })} />

          <label htmlFor="password" className="font-bold text-gray-600">Passwort</label>
          <input type="password" name="password" id="password" placeholder="Passwort" className={clsx("rounded-full p-2 m-4 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1", { "border-red-600 ring-red-600": passwordError })} />

          <button type="submit" className="btn">Einlogen</button>
        </div>
      </form>
      <Toaster position="bottom-center" />
    </div>
  );
}
