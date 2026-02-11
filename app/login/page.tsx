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
        <div className="flex flex-col gap-4 p-2">
          <h2>Anmelden</h2>
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Nutzername
            </label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Nutzername"
              className={clsx(
                "w-full rounded-lg border-2 px-4 py-2 outline-none transition-all focus:ring-2",
                usernameError
                  ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-200 focus:border-green-500 focus:ring-green-100"
              )}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Passwort
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Passwort"
              className={clsx(
                "w-full rounded-lg border-2 px-4 py-2 outline-none transition-all focus:ring-2",
                passwordError
                  ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-200 focus:border-green-500 focus:ring-green-100"
              )}
              required
            />
            {passwordResetURL && (
              <div className="flex justify-end">
                <a href={passwordResetURL} className="text-xs text-gray-500 hover:text-green-600 hover:underline">
                  Passwort vergessen?
                </a>
              </div>
            )}
          </div>

          <SubmitButton text="Anmelden" />
        </div>
      </form>
      <Toaster richColors />
    </div>
  );
}

export default LoginPage;