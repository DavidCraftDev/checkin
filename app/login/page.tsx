"use client";

import { signIn } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { FormEvent, useEffect, useState } from "react";
import getPasswordResetURL from "./passwordReset";
import React from "react";

function Login() {
  const router = useRouter();
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;
    setDisabled(true);
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    setUsernameError(false);
    setPasswordError(false);
    if (!username) {
      setUsernameError(true);
      toast.error("Bitte einen Nutzernamen eingeben")
      setDisabled(false);
      return
    } else if (!password) {
      setPasswordError(true);
      toast.error("Bitte ein Passwort eingeben")
      setDisabled(false);
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
      setErrorCount(errorCount + 1);
      setDisabled(false);
      if (errorCount >= 10) {
        router.push("/login/limit");
      }
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
      <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-md">
        <div className="mb-2 flex h-20 items-end justify-start rounded-md bg-green-600 p-4 md:h-40">
          <div className="text-xl font-semibold text-white md:text-2xl">
            CheckIN
          </div>
        </div>
        <div className="flex flex-col space-y-4">
          <h1>Anmelden</h1>
          <label htmlFor="username" className="font-bold text-gray-600">Nutzername</label>
          <input type="text" name="username" id="username" placeholder="Nutzername" className={clsx("rounded-full p-2 m-4 border-2 ring-0 ring-black focus:outline-none focus:ring-1", { "border-red-600 ring-red-600": usernameError })} required/>

          <label htmlFor="password" className="font-bold text-gray-600">Passwort</label>
          <input type="password" name="password" id="password" placeholder="Passwort" className={clsx("rounded-full p-2 m-4 border-2 ring-0 ring-black focus:outline-none focus:ring-1", { "border-red-600 ring-red-600": passwordError })} required/>

          {passwordResetURL ? <a href={passwordResetURL} className="text-gray-400 text-xs ml-5 hover:underline" style={{ marginTop: "-3.5px" }}>Passwort vergessen?</a> : null}

          <button type="submit" className="btn">Anmelden</button>
        </div>
      </form>
      <Toaster position="bottom-center" />
    </div>
  );
}

export default Login;
