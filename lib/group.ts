"use server";

import { User } from "@prisma/client";
import { getSessionUser } from "./auth/cookieManager";
import db from "./db";

export async function getGroupUsers(groupID: string): Promise<User[]> {
    // Get session user & check if user is allowed to get this data
    const sessionUser = await getSessionUser(1);
    if (sessionUser.permission !== 2 && sessionUser.groups.find(group => group === groupID) == undefined) return [];

    // Get all users in group
    const users = await db.user.findMany({
        where: {
            group: {
                has: groupID
            }
        }
    });

    return users;
}