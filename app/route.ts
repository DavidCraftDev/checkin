// 🏠 ROOT ROUTE! The front door of our application! 🚪
import { NextRequest, NextResponse } from "next/server"; // 📨 Next.js request/response magic!
import { getCurrentSession } from "./src/modules/auth/cookieManager"; // 🍪 Session cookie manager!
import { redirect } from "next/navigation"; // 🧭 Navigation redirect powers!

// 🎯 GET request handler - Where should we send you? 🤔
export async function GET(request: NextRequest) {
    const { session } = await getCurrentSession(); // 🍪 Checking your credentials at the door!
    // 🚦 Traffic controller: Logged in? Dashboard! Not logged in? Login page! 
    if (session) redirect("/dashboard"); // ✅ Welcome back! Off to the dashboard!
    else redirect("/login"); // 🔐 Who are you? Show me your login!
}