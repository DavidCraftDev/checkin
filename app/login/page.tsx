"use client"; // 🎯 Because we're living on the edge! No server-side rendering here, folks! 🚀

import { Toaster, toast } from "sonner"; // 🍞 Toast notifications - because everyone loves toast! 🥪
import { useRouter } from "next/navigation"; // 🧭 GPS for your app - "Recalculating route..." 📍
import clsx from "clsx"; // 🎨 The Picasso of className strings! 🖌️
import { FormEvent, useEffect, useState } from "react"; // ⚛️ React hooks - like fishing hooks but for state! 🎣
import getPasswordResetURL from "./passwordReset"; // 🔑 For when you inevitably forget your password... again 😅
import React from "react"; // ⚛️ The OG - Original Genius! 💎
import { login } from "../src/modules/auth/loginManager"; // 🔐 The bouncer at the club - "You shall not pass!" 🛡️
import { ArrowPathIcon } from "@heroicons/react/24/outline"; // 🔄 Spinny spin goes brrrrr 🌀

// 🎪 Welcome to the LOGIN CIRCUS! Step right up! 🎭
function LoginPage() {
  const router = useRouter(); // 🚗 Vroom vroom! Navigation go zoom! 💨
  const [usernameError, setUsernameError] = useState(false); // ❌ Oopsie detector 9000 for usernames! 🚨
  const [passwordError, setPasswordError] = useState(false); // 🔒 Password police - "That's not right, buddy!" 👮
  const [disabled, setDisabled] = useState(false); // 🚫 The "Don't click me I'm busy!" button state 🛑
  const [errorCount, setErrorCount] = useState(0); // 🧮 Counting your mistakes like a disappointed parent 📊

  // 🎬 The MAIN EVENT! Ladies and gentlemen, the submit handler! 🎪
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // 🛑 STOP RIGHT THERE, default behavior! 🚨
    if (disabled) return; // 🙅 Already working, please hold! ⏳
    setDisabled(true); // 🔒 Locking it down like Fort Knox! 🏰
    const formData = new FormData(event.currentTarget); // 📦 Unwrapping the data gift! 🎁
    const username = formData.get("username") as string; // 👤 Who dis? New phone! 📱
    const password = formData.get("password") as string; // 🤫 Shhhh, it's a secret! 🙊
    setUsernameError(false); // ✅ Clearing the username shame board! 🧹
    setPasswordError(false); // ✅ Wiping the password slate clean! 🧼
    
    // 🔍 Time to validate like we're the TSA at an airport! ✈️
    if (!username) {
      setUsernameError(true); // 🚨 RED ALERT! Username MIA! 🚁
      toast.error("Bitte einen Nutzernamen eingeben"); // 🍞 Toasty error message! 🔥
      setDisabled(false); // 🔓 Try again, champ! 💪
      return; // 👋 Buh-bye! Come back when you remember your username! 🚪
    } else if (!password) {
      setPasswordError(true); // 🔴 Password? More like pass-NOPE! 🙅‍♂️
      toast.error("Bitte ein Passwort eingeben"); // 🍞 Another toasty reminder! 🥐
      setDisabled(false); // 🔓 Back to the drawing board! 📝
      return // 👋 See ya! Don't forget the password this time! 🗝️
    }
    
    // 🎲 Rolling the login dice... will you win?! 🎰
    const result = await login(username.trim(), password); // ✂️ Trimming whitespace like a fancy barber! 💈
    if (result) {
      router.push("/dashboard"); // 🎉 SUCCESS! Welcome to the VIP lounge! 🌟
    } else {
      toast.error("Falscher Nutzername oder Passwort"); // 😱 REJECTED! Back to the end of the line! 🚫
      setErrorCount((prevErrorCount) => prevErrorCount + 1); // ➕ Another one bites the dust! 💀
      setDisabled(false); // 🔄 Try, try again! Third time's the charm... right? 🍀
      if (errorCount >= 10) {
        router.push("/login/limit"); // 🚔 OK that's enough, you're going to timeout jail! ⏰
      }
    }
  }

  // 🆘 The "I forgot my password AGAIN" rescue mission! 🚁
  const [passwordResetURL, setPasswordResetURL] = useState(""); // 🔗 Link storage - it's empty now but won't be for long! 📦
  useEffect(() => {
    // 🎣 Fishing for that password reset URL! 🐟
    async function fetchPasswordResetURL() {
      setPasswordResetURL(await getPasswordResetURL()); // 📡 Fetching from the URL dimension! 🌌
    }
    fetchPasswordResetURL(); // 🏃 Go fetch! Good function! 🐕
  }, []); // 🔄 Run once and never again - like my gym membership! 🏋️
  // 🎨 Time to PAINT this beautiful UI masterpiece! 🖼️
  return (
    <div className="flex items-center justify-center h-screen bg-gray-200"> {/* 🏠 The gray background - fancy! 🎭 */}
      <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-md"> {/* 📋 The form - where magic happens! ✨ */}
        <div className="mb-2 flex h-20 items-end justify-start rounded-md bg-green-600 p-4 md:h-40"> {/* 💚 Green header - eco-friendly login! 🌱 */}
          <span className="text-xl font-semibold text-white md:text-2xl">
            CheckIN {/* ✅ The name's IN... Check IN 🕵️ */}
          </span>
        </div>
        <div className="flex flex-col space-y-4"> {/* 📚 Flexbox - the ultimate organizer! 🗂️ */}
          <h1>Anmelden</h1> {/* 🚪 "Come on in!" in German! 🇩🇪 */}
          <label htmlFor="username" className="font-bold text-gray-600">Nutzername</label> {/* 👤 Username label looking snazzy! 😎 */}
          <input type="text" name="username" id="username" placeholder="Nutzername" className={clsx("rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black focus:outline-hidden focus:ring-1", { "border-red-600 ring-red-600": usernameError })} required/> {/* ⌨️ Type your name here... no, your USERNAME! 🤦 */}

          <label htmlFor="password" className="font-bold text-gray-600">Passwort</label> {/* 🔐 The secret sauce label! 🥫 */}
          <input type="password" name="password" id="password" placeholder="Passwort" className={clsx("rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black focus:outline-hidden focus:ring-1", { "border-red-600 ring-red-600": passwordError })} required/> {/* 🤐 Dots instead of letters - fancy encryption! 🔒 */}

          {passwordResetURL ? <a href={passwordResetURL} className="text-gray-400 text-xs ml-5 hover:underline" style={{ marginTop: "-3px" }}>Passwort vergessen?</a> : null} {/* 🤔 "Oops, I did it again..." - Britney, probably 🎤 */}

          <button type="submit" className="btn flex justify-center items-center gap-2" disabled={disabled}> {/* 🎯 The SUBMIT button - the moment of truth! 🎲 */}
            {disabled && <ArrowPathIcon className="h-5 w-5 animate-spin" />} {/* 🌀 Spinny boi is working HARD! 💪 */}
            {disabled ? "Anmelden..." : "Anmelden"} {/* ⏳ "Logging in..." or "Login" - the eternal question! 🤷 */}
          </button>
        </div>
      </form>
      <Toaster richColors /> {/* 🍞 Toast central - all your notifications, extra crispy! 🔥 */}
    </div>
  );
}

export default LoginPage; // 📤 Exporting this bad boy to the world! 🌍 Go forth and authenticate! 🚀