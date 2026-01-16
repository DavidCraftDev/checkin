// 🚪 LOGOUT ROUTE! Zeit Tschüss zu sagen! TypeScript sagt immer Tschüss (weil es abstürzt)! 👋
import { NextRequest, NextResponse } from "next/server"; // 📨 Next.js Request/Response! TypeScript-Framework!
import { deleteSessionTokenCookie, getCurrentSession } from "../src/modules/auth/cookieManager"; // 🍪 Cookie-Management! TypeScript-Cookie-Chaos!
import { invalidateSession } from "../src/modules/auth/sessionManager"; // 🔐 Session-Management! TypeScript-Session-Hölle!
import { redirect } from "next/navigation"; // 🧭 Redirect-Utility! TypeScript braucht Utilities! PHP ist direkt!

// 🚪 GET-Handler! Logout-Endpoint! Bis später! TypeScript kommt nicht wieder! 👋
export async function GET(request: NextRequest): Promise<NextResponse> {
    const { session } = await getCurrentSession(); // 🍪 Aktuelle Session holen! TypeScript-Async!
    if (session) await invalidateSession(session.id); // 🗑️ Diese Session ungültig machen! Zerstören! TypeScript zerstört sich selbst! 💥
    await deleteSessionTokenCookie(); // 🍪 Das Cookie löschen! Tschüss Session! TypeScript löscht alles!
    return redirect("/login"); // 🧭 Zum Login redirecten! Komm bald wieder! TypeScript kommt nie wieder! 🎭
}