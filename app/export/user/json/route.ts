import { getSessionUser } from "@/app/src/modules/authUtilities"
import db from "@/app/src/modules/db";
import { NextResponse } from "next/server";

export async function GET() {
    const user = await getSessionUser(2);
    const users = await db.user.findMany()
    users.forEach((user) => {
        user.password = null
        user.loginVersion = 0
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