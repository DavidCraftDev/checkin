"use client";

import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useEffect, useState } from "react";
import getPasswordResetURL from "./passwordReset";
import { login } from "@/app/src/modules/auth/loginManager";
import { SubmitButton } from "../src/ui/submitButton";

function LoginPage() {
  const router = useRouter();
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    if (errorCount >= 10) {
      router.push("/login/limit");
    }
  }, [errorCount, router]);

  async function handleLogin(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    setUsernameError(false);
    setPasswordError(false);

    let hasError = false;

    if (!username) {
      setUsernameError(true);
      toast.error("Bitte einen Nutzernamen eingeben");
      hasError = true;
    }

    if (!password) {
      setPasswordError(true);
      toast.error("Bitte ein Passwort eingeben");
      hasError = true;
    }

    if (hasError) return;

    const result = await login(username.trim(), password);
    if (result) {
      router.push("/dashboard");
    } else {
      toast.error("Falscher Nutzername oder Passwort");
      setErrorCount((prev) => prev + 1);
    }
  }

  const [passwordResetURL, setPasswordResetURL] = useState("");
  useEffect(() => {
    async function fetchPasswordResetURL() {
      setPasswordResetURL(await getPasswordResetURL());
    }
    fetchPasswordResetURL();
  }, []);
  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <form action={handleLogin} className="p-4 bg-white rounded-lg shadow-md">
        <div className="mb-2 flex h-20 items-end justify-start rounded-md bg-green-600 p-4 md:h-40">
          <span className="text-xl font-semibold text-white md:text-2xl">
            CheckIN
          </span>
        </div>
        <div className="flex flex-col space-y-4">
          <h1>Anmelden</h1>
          <label htmlFor="username" className="font-bold text-gray-600">Nutzername</label>
          <input type="text" name="username" id="username" placeholder="Nutzername" className={clsx("rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black focus:outline-hidden focus:ring-1", { "border-red-600 ring-red-600": usernameError })} required />

          <label htmlFor="password" className="font-bold text-gray-600">Passwort</label>
          <input type="password" name="password" id="password" placeholder="Passwort" className={clsx("rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black focus:outline-hidden focus:ring-1", { "border-red-600 ring-red-600": passwordError })} required />

          {passwordResetURL ? <a href={passwordResetURL} className="text-gray-400 text-xs ml-5 hover:underline" style={{ marginTop: "-3px" }}>Passwort vergessen?</a> : null}

          <SubmitButton text="Anmelden" />
        </div>
      </form>
      <Toaster richColors />
    </div>
  );
}

export default LoginPage;