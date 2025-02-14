"use server";

import { getSessionUser } from "./auth/cookieManager";
import db from "./db";

export async function getGroupUsers(groupID: string) {
    // Get session user & check if user is allowed to get this data
    const sessionUser = await getSessionUser(1);
    if (sessionUser.permission !== 2 && sessionUser.group.find(group => group === groupID) == undefined) return null;

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