"use server";

import { cookies } from "next/headers";
import { SessionValidationResult, validateSessionToken } from "./sessionManager";
import { redirect } from "next/navigation";

export async function setSessionTokenCookie(token: string, expiresAt: Date): Promise<void> {
    cookies().set("session", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
        path: "/"
    });
}

export async function deleteSessionTokenCookie(): Promise<void> {
    cookies().set("session", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        path: "/"
    });
}

export async function getCurrentSession(): Promise<SessionValidationResult> {
    const token = cookies().get("session")?.value ?? null;
    if (token === null) return { session: null, user: null };
    const result = await validateSessionToken(token);
    return result;
}

export async function getSessionUser(permission?: number) {
    const { user, session } = await getCurrentSession();
    if(!session) redirect("/login");
    if (permission && user.permission < permission) redirect("/dashboard");
    return user;
}