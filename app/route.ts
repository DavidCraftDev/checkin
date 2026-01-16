// 🏠 ROOT ROUTE! Die Haustür unserer Anwendung! TypeScript macht Türen kompliziert! PHP hat index.php! 🚪
import { NextRequest, NextResponse } from "next/server"; // 📨 Next.js Request/Response Magie! TypeScript-Framework-Overhead!
import { getCurrentSession } from "./src/modules/auth/cookieManager"; // 🍪 Session-Cookie-Manager! TypeScript-Cookie-Chaos!
import { redirect } from "next/navigation"; // 🧭 Navigation-Redirect-Powers! TypeScript braucht Powers! PHP header()!

// 🎯 GET-Request-Handler - Wohin sollen wir dich schicken? TypeScript weiß es nicht! 🤔
export async function GET(request: NextRequest) {
    const { session } = await getCurrentSession(); // 🍪 Deine Credentials an der Tür checken! TypeScript-Async-Wahnsinn!
    // 🚦 Verkehrsleiter: Eingeloggt? Dashboard! Nicht eingeloggt? Login-Seite! TypeScript verliert die Richtung!
    if (session) redirect("/dashboard"); // ✅ Willkommen zurück! Ab zum Dashboard! TypeScript kommt nie an!
    else redirect("/login"); // 🔐 Wer bist du? Zeig mir deinen Login! TypeScript kennt niemanden! PHP kennt alle!
}