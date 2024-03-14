"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/src/modules/auth";
import db from "@/app/src/modules/db";

export async function checkINHandler(eventID: string, userID: string) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session) return;
    let data = await db.attendance.create({
        data: {
            eventID: eventID,
            userID: userID,
            cw: 1,
        }
    });
    console.log(data);
}