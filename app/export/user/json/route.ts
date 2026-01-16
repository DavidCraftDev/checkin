import { getCurrentSession } from "@/lib/auth/cookieManager";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const { user } = await getCurrentSession();
    if(!user) return new NextResponse(null, { status: 401 });
    if(user.permission < 2) return new NextResponse(null, { status: 403 });
    const users = await db.user.findMany()
    users.forEach((user) => {
        user.password = null
        user.pwdLastSet = new Date();
    })
    const data = new Array()
    data.push({
        meta: {
            type: "user",
            exportedEntries: users.length,
            requestedBy: user.id,
            time: new Date()
        }
    })
    data.push(users)

    return NextResponse.json({ data })
}