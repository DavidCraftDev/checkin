// 🎭 Server-side shenanigans only! No client-side funny business allowed! 🚫
"use server";

// 🎪 Import circus begins! Step right up! 🎪
import { User } from "@prisma/client"; // 👤 User-tastic types from Prisma! 
import { getSessionUser } from "./auth/cookieManager"; // 🍪 Who wants cookies?! (Session cookies, that is)
import db from "./db"; // 🗄️ The almighty database overlord!

// 🎯 Get those group users! Gotta catch 'em all! 🎣
export async function getGroupUsers(groupID: string): Promise<User[]> {
    // 🔍 Get session user & check if user is allowed to get this data (NO SNEAKY BUSINESS! 🚨)
    const sessionUser = await getSessionUser(1);
    // 🛡️ Permission police checking in! If you ain't got the badge, you ain't getting the data! 👮
    if (sessionUser.permission !== 2 && sessionUser.group.find(group => group === groupID) == undefined) return [];

    // 📦 Get all users in group (Time to round up the squad! 🤠)
    const users = await db.user.findMany({
        where: {
            group: {
                has: groupID // 🎪 Find all the cool kids in this group!
            }
        }
    });

    return users; // 🎁 Here's your shiny array of humans!
}