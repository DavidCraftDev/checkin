// 🚪 LOGOUT ROUTE! Time to say goodbye! 👋
import { NextRequest, NextResponse } from "next/server"; // 📨 Next.js request/response!
import { deleteSessionTokenCookie, getCurrentSession } from "../src/modules/auth/cookieManager"; // 🍪 Cookie management!
import { invalidateSession } from "../src/modules/auth/sessionManager"; // 🔐 Session management!
import { redirect } from "next/navigation"; // 🧭 Redirect utility!

// 🚪 GET handler! Logout endpoint! See ya later! 👋
export async function GET(request: NextRequest): Promise<NextResponse> {
    const { session } = await getCurrentSession(); // 🍪 Get current session!
    if (session) await invalidateSession(session.id); // 🗑️ Invalidate that session! Destroy it! 💥
    await deleteSessionTokenCookie(); // 🍪 Delete the cookie! Bye bye session! 
    return redirect("/login"); // 🧭 Redirect to login! Come back soon! 🎭
}