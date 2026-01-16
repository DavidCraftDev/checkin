// 🎭 Server-side 404 handler! Where did the page go? 🤔
"use server";

// 🧭 Navigation imports - Let's get you back on track! 🗺️
import { redirect } from "next/navigation"; // 🚀 Redirect like a GPS!
import { getCurrentSession } from "./src/modules/auth/cookieManager"; // 🍪 Check those cookies!

// 🔍 404 Not Found! But we won't leave you hanging! 🙌
export default async function notFound() {
    const { session } = await getCurrentSession(); // 🍪 Do you have a valid session cookie?
    // 🎯 Logged in? Back to dashboard! Not logged in? Time to login! 🚪
    if (session) redirect('/dashboard'); // ✅ You belong in the dashboard!
    else redirect('/login'); // 🔐 No session? Login time!
}