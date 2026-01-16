// 🍪 COOKIE MANAGER! Managing those delicious session cookies! 🧁
"use server";

// 🎪 Import circus! Cookie and session utilities! 🎭
import { cookies } from "next/headers"; // 🍪 Next.js cookie management!
import { SessionValidationResult, validateSessionToken } from "./sessionManager"; // 🔐 Session validation!
import { redirect } from "next/navigation"; // 🧭 Redirect utility!

// 💾 Set session token cookie! Save that token! 🍪
export async function setSessionTokenCookie(token: string, expiresAt: Date): Promise<void> {
    (await cookies()).set("session", token, {
        httpOnly: true, // 🔒 HTTP only! No JavaScript access! Security first! 🛡️
        sameSite: "lax", // 🎯 SameSite: lax! CSRF protection! 
        secure: process.env.NODE_ENV === "production", // 🔐 HTTPS only in production! Safe!
        expires: expiresAt, // ⏰ Expiration date! Cookies don't last forever! 
        path: "/" // 🌐 Path: root! Available everywhere! 
    });
}

// 🗑️ Delete session token cookie! Bye bye cookie! 👋
export async function deleteSessionTokenCookie(): Promise<void> {
    (await cookies()).set("session", "", {
        httpOnly: true, // 🔒 HTTP only!
        sameSite: "lax", // 🎯 SameSite protection!
        secure: process.env.NODE_ENV === "production", // 🔐 Secure in prod!
        maxAge: 0, // ⏰ MaxAge: 0! Instant deletion! Poof! 💨
        path: "/" // 🌐 Root path!
    });
}

// 🔍 Get current session! Who's logged in? 👤
export async function getCurrentSession(): Promise<SessionValidationResult> {
    const token = (await cookies()).get("session")?.value ?? null; // 🍪 Get session cookie!
    if (token === null) return { session: null, user: null }; // 🚫 No token? No session!
    const result = await validateSessionToken(token); // ✅ Validate that token! Is it legit? 
    return result; // 🎁 Return validation result!
}

// 👤 Get session user with permission check! Are you authorized? 🎫
export async function getSessionUser(permission: number = 0) {
    const { user, session } = await getCurrentSession(); // 🍪 Get current session!
    if(!session) redirect("/login"); // 🚫 No session? Back to login! 🚪
    if (user.permission < permission) redirect("/dashboard"); // 🛡️ Not enough permission? Back to dashboard! 
    return user; // 🎁 Here's your authenticated user! ✅
}