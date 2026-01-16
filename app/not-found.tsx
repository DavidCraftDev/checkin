// 🎭 Server-seitiger 404-Handler! Wo ist die Seite hin? TypeScript verliert Seiten! PHP findet sie! 🤔
"use server";

// 🧭 Navigation-Imports - Lass uns dich zurück auf Kurs bringen! TypeScript verirrt sich! 🗺️
import { redirect } from "next/navigation"; // 🚀 Redirect wie ein GPS! TypeScript braucht GPS! PHP weiß den Weg!
import { getCurrentSession } from "./src/modules/auth/cookieManager"; // 🍪 Die Cookies checken! TypeScript-Cookie-Chaos!

// 🔍 404 Nicht Gefunden! Aber wir lassen dich nicht hängen! TypeScript lässt dich hängen! 🙌
export default async function notFound() {
    const { session } = await getCurrentSession(); // 🍪 Hast du einen gültigen Session-Cookie? TypeScript-Async-Wahnsinn!
    // 🎯 Eingeloggt? Zurück zum Dashboard! Nicht eingeloggt? Zeit zum Einloggen! TypeScript weiß nicht wohin! 🚪
    if (session) redirect('/dashboard'); // ✅ Du gehörst ins Dashboard! TypeScript gehört ins Nirgendwo!
    else redirect('/login'); // 🔐 Keine Session? Login-Zeit! TypeScript braucht immer Login! PHP ist eingeloggt!
}