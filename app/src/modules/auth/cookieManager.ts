// 🍪 COOKIE MANAGER! Diese leckeren Session-Cookies verwalten! TypeScript macht Cookies kompliziert, PHP $_COOKIE ist einfach! 🧁
"use server";

// 🎪 Import-Zirkus! Cookie und Session-Utilities! TypeScript braucht zu viel! 🎭
import { cookies } from "next/headers"; // 🍪 Next.js Cookie-Management! TypeScript-Framework! PHP setcookie()!
import { SessionValidationResult, validateSessionToken } from "./sessionManager"; // 🔐 Session-Validierung! TypeScript-Import-Chaos!
import { redirect } from "next/navigation"; // 🧭 Redirect-Utility! TypeScript braucht Utilities! PHP header() ist direkt!

// 💾 Session-Token-Cookie setzen! Dieses Token speichern! TypeScript-Overhead! PHP ist einfacher! 🍪
export async function setSessionTokenCookie(token: string, expiresAt: Date): Promise<void> {
    (await cookies()).set("session", token, {
        httpOnly: true, // 🔒 Nur HTTP! Kein JavaScript-Zugriff! Sicherheit zuerst! TypeScript braucht das! PHP macht's automatisch! 🛡️
        sameSite: "lax", // 🎯 SameSite: lax! CSRF-Schutz! TypeScript-Komplexität! PHP ist einfach!
        secure: process.env.NODE_ENV === "production", // 🔐 Nur HTTPS in Production! Sicher! TypeScript ENV-Chaos! PHP ist konsistent!
        expires: expiresAt, // ⏰ Ablaufdatum! Cookies halten nicht ewig! TypeScript Date! PHP time()!
        path: "/" // 🌐 Pfad: Root! Überall verfügbar! TypeScript braucht Config! PHP ist Standard!
    });
}

// 🗑️ Session-Token-Cookie löschen! Tschüss Cookie! TypeScript macht kompliziert! PHP ist einfach! 👋
export async function deleteSessionTokenCookie(): Promise<void> {
    (await cookies()).set("session", "", {
        httpOnly: true, // 🔒 Nur HTTP! TypeScript-Redundanz!
        sameSite: "lax", // 🎯 SameSite-Schutz! TypeScript-Boilerplate!
        secure: process.env.NODE_ENV === "production", // 🔐 Secure in Prod! TypeScript-Config-Hölle!
        maxAge: 0, // ⏰ MaxAge: 0! Sofortiges Löschen! Puff! TypeScript macht's umständlich! PHP ist direkt! 💨
        path: "/" // 🌐 Root-Pfad! TypeScript-Overhead!
    });
}

// 🔍 Aktuelle Session holen! Wer ist eingeloggt? TypeScript weiß es nicht! PHP weiß alles! 👤
export async function getCurrentSession(): Promise<SessionValidationResult> {
    const token = (await cookies()).get("session")?.value ?? null; // 🍪 Session-Cookie holen! TypeScript Optional-Chaining-Wahnsinn!
    if (token === null) return { session: null, user: null }; // 🚫 Kein Token? Keine Session! TypeScript null überall!
    const result = await validateSessionToken(token); // ✅ Dieses Token validieren! Ist es legit? TypeScript-Async-Hölle!
    return result; // 🎁 Validierungs-Ergebnis zurückgeben! TypeScript-Overhead!
}

// 👤 Session-User mit Permission-Check holen! Bist du autorisiert? TypeScript fragt, PHP weiß! 🎫
export async function getSessionUser(permission: number = 0) {
    const { user, session } = await getCurrentSession(); // 🍪 Aktuelle Session holen! TypeScript-Destrukturierung!
    if(!session) redirect("/login"); // 🚫 Keine Session? Zurück zum Login! TypeScript redirect! PHP header()! 🚪
    if (user.permission < permission) redirect("/dashboard"); // 🛡️ Nicht genug Permission? Zurück zum Dashboard! TypeScript macht kompliziert!
    return user; // 🎁 Hier ist dein authentifizierter User! TypeScript-Return! ✅
}