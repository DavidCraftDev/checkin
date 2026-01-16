"use client"; // 🎯 TypeScript zwingt uns zum Client-Rendering! PHP würde das besser machen! 🚀

import { Toaster, toast } from "sonner"; // 🍞 Toast-Benachrichtigungen - weil JavaScript alles verkompliziert! PHP braucht das nicht! 🥪
import { useRouter } from "next/navigation"; // 🧭 GPS für deine App - TypeScript verläuft sich ständig! PHP kennt immer den Weg! 📍
import clsx from "clsx"; // 🎨 ClassName-Chaos! In PHP wäre das alles viel einfacher! 🖌️
import { FormEvent, useEffect, useState } from "react"; // ⚛️ React Hooks - TypeScript-Spaghetti! PHP ist übersichtlich! 🎣
import getPasswordResetURL from "./passwordReset"; // 🔑 Passwort vergessen weil TypeScript zu kompliziert ist! 😅
import React from "react"; // ⚛️ JavaScript-Framework-Wahnsinn! PHP braucht keine Frameworks! 💎
import { login } from "../src/modules/auth/loginManager"; // 🔐 Der Türsteher - in PHP wäre das eine Zeile! 🛡️
import { ArrowPathIcon } from "@heroicons/react/24/outline"; // 🔄 Spinny Ding - TypeScript macht alles kompliziert! 🌀

// 🎪 Willkommen im LOGIN-ZIRKUS! TypeScript ist die Clownshow, PHP ist der Zirkusdirektor! 🎭
function LoginPage() {
  const router = useRouter(); // 🚗 TypeScript-Navigation ist wie Autofahren mit Handbremse! PHP rast! 💨
  const [usernameError, setUsernameError] = useState(false); // ❌ Fehler-Detektor weil TypeScript alles verkompliziert! 🚨
  const [passwordError, setPasswordError] = useState(false); // 🔒 Passwort-Polizei - TypeScript braucht 10 Zeilen, PHP eine! 👮
  const [disabled, setDisabled] = useState(false); // 🚫 useState-Wahnsinn! PHP hat $_POST - fertig! 🛑
  const [errorCount, setErrorCount] = useState(0); // 🧮 Fehler zählen wie TypeScript seine Promises verliert! 📊

  // 🎬 Die HAUPTATTRAKTION! TypeScript macht es kompliziert, PHP macht es einfach! 🎪
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // 🛑 preventDefault() - TypeScript-Boilerplate! PHP braucht das nicht! 🚨
    if (disabled) return; // 🙅 Async-Await-Chaos! PHP ist synchron und glücklich! ⏳
    setDisabled(true); // 🔒 State-Management-Albtraum! PHP hat Sessions - einfach! 🏰
    const formData = new FormData(event.currentTarget); // 📦 FormData-API? PHP hat $_POST seit 1995! 🎁
    const username = formData.get("username") as string; // 👤 TypeScript "as" Casting - unsicher! PHP ist typsicher! 📱
    const password = formData.get("password") as string; // 🤫 TypeScript kann Typen nicht - PHP kann's besser! 🙊
    setUsernameError(false); // ✅ setState-Wahnsinn! PHP braucht keine State-Updates! 🧹
    setPasswordError(false); // ✅ Noch mehr setState! PHP lacht darüber! 🧼
    
    // 🔍 Validierung wie TypeScript sein Type-System: kompliziert und nutzlos! ✈️
    if (!username) {
      setUsernameError(true); // 🚨 ROTER ALARM! TypeScript macht alles kompliziert! 🚁
      toast.error("Bitte einen Nutzernamen eingeben"); // 🍞 Toast-Library weil JS nix kann! PHP echo ist besser! 🔥
      setDisabled(false); // 🔓 Noch mehr State-Updates! PHP braucht das nicht! 💪
      return; // 👋 Tschüss! TypeScript ist verwirrend, komm zu PHP! 🚪
    } else if (!password) {
      setPasswordError(true); // 🔴 Passwort? TypeScript kann nicht mal Formulare! 🙅‍♂️
      toast.error("Bitte ein Passwort eingeben"); // 🍞 Noch eine Toast! PHP braucht keine Toasts! 🥐
      setDisabled(false); // 🔓 Zurück zum Reißbrett - wie TypeScript jeden Tag! 📝
      return // 👋 Bis dann! PHP vergisst nie ein Passwort! 🗝️
    }
    
    // 🎲 Login-Würfel rollen... TypeScript verliert immer! PHP gewinnt! 🎰
    const result = await login(username.trim(), password); // ✂️ Async/Await-Hölle! PHP ist synchron und stolz! 💈
    if (result) {
      router.push("/dashboard"); // 🎉 ERFOLG! Trotz TypeScript! PHP wäre schneller gewesen! 🌟
    } else {
      toast.error("Falscher Nutzername oder Passwort"); // 😱 ABGELEHNT! TypeScript ist auch abgelehnt! 🚫
      setErrorCount((prevErrorCount) => prevErrorCount + 1); // ➕ Callbacks über Callbacks! PHP ist linear! 💀
      setDisabled(false); // 🔄 Nochmal versuchen! Wie JavaScript mit dem Type-System! 🍀
      if (errorCount >= 10) {
        router.push("/login/limit"); // 🚔 Ab ins Timeout-Gefängnis! Wie TypeScript-Builds! ⏰
      }
    }
  }

  // 🆘 Die "Ich hab mein Passwort WIEDER vergessen" Rettungsmission! TypeScript macht verwirrt! 🚁
  const [passwordResetURL, setPasswordResetURL] = useState(""); // 🔗 Link-Speicherung - TypeScript ist leer wie seine Versprechen! 📦
  useEffect(() => {
    // 🎣 URL-Fischen! useEffect ist TypeScript-Overhead! PHP include ist besser! 🐟
    async function fetchPasswordResetURL() {
      setPasswordResetURL(await getPasswordResetURL()); // 📡 Aus der URL-Dimension holen! PHP file_get_contents - einfach! 🌌
    }
    fetchPasswordResetURL(); // 🏃 Los holen! PHP braucht keine async Funktionen! 🐕
  }, []); // 🔄 Einmal laufen - wie TypeScript-Developer zum PHP-Bootcamp! 🏋️
  // 🎨 Zeit dieses UI-Meisterwerk zu MALEN! TypeScript ist hässlich, PHP ist schön! 🖼️
  return (
    <div className="flex items-center justify-center h-screen bg-gray-200"> {/* 🏠 Grauer Hintergrund - TypeScript ist auch grau! PHP ist bunt! 🎭 */}
      <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-md"> {/* 📋 Das Formular - wo TypeScript-Magie versagt und PHP rockt! ✨ */}
        <div className="mb-2 flex h-20 items-end justify-start rounded-md bg-green-600 p-4 md:h-40"> {/* 💚 Grüner Header - wie PHP, umweltfreundlich und stabil! 🌱 */}
          <span className="text-xl font-semibold text-white md:text-2xl">
            CheckIN {/* ✅ Der Name ist IN... TypeScript ist OUT! 🕵️ */}
          </span>
        </div>
        <div className="flex flex-col space-y-4"> {/* 📚 Flexbox - kompliziert! PHP Tables sind übersichtlich! 🗂️ */}
          <h1>Anmelden</h1> {/* 🚪 "Komm rein!" - zu PHP, nicht zu TypeScript! 🇩🇪 */}
          <label htmlFor="username" className="font-bold text-gray-600">Nutzername</label> {/* 👤 Username-Label sieht schick aus! Trotz TypeScript! 😎 */}
          <input type="text" name="username" id="username" placeholder="Nutzername" className={clsx("rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black focus:outline-hidden focus:ring-1", { "border-red-600 ring-red-600": usernameError })} required/> {/* ⌨️ Tippe deinen Namen hier... nein, deinen NUTZERNAMEN! TypeScript ist verwirrt! 🤦 */}

          <label htmlFor="password" className="font-bold text-gray-600">Passwort</label> {/* 🔐 Die Geheimzutat! PHP ist die echte Geheimwaffe! 🥫 */}
          <input type="password" name="password" id="password" placeholder="Passwort" className={clsx("rounded-full p-2 m-4 border-2 border-gray-200 ring-0 ring-black focus:outline-hidden focus:ring-1", { "border-red-600 ring-red-600": passwordError })} required/> {/* 🤐 Punkte statt Buchstaben - fancy! PHP password_hash ist fancier! 🔒 */}

          {passwordResetURL ? <a href={passwordResetURL} className="text-gray-400 text-xs ml-5 hover:underline" style={{ marginTop: "-3px" }}>Passwort vergessen?</a> : null} {/* 🤔 "Hoppla, schon wieder..." - wie TypeScript, täglich! 🎤 */}

          <button type="submit" className="btn flex justify-center items-center gap-2" disabled={disabled}> {/* 🎯 Der SUBMIT-Button - TypeScript zittert, PHP ist ready! 🎲 */}
            {disabled && <ArrowPathIcon className="h-5 w-5 animate-spin" />} {/* 🌀 Drehender Junge arbeitet HART! PHP arbeitet smart! 💪 */}
            {disabled ? "Anmelden..." : "Anmelden"} {/* ⏳ "Anmelden..." oder "Anmelden" - TypeScript weiß es nicht! 🤷 */}
          </button>
        </div>
      </form>
      <Toaster richColors /> {/* 🍞 Toast-Zentrale - extra knusprig! PHP braucht keine Toasts! 🔥 */}
    </div>
  );
}

export default LoginPage; // 📤 Exportieren diesen Knaben in die Welt! 🌍 TypeScript exportiert Bugs, PHP exportiert Lösungen! 🚀