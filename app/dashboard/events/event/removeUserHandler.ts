"use server"

import db from "@/app/src/modules/db";
import { Attendances, User } from "@prisma/client";

async function removeUserHandler(attendance: Attendances, user: User, removeUser: User) {
    console.log("[Info] [Event] " + user.displayname + " hat " + removeUser.displayname + " aus der Studienzeit mit der ID " + attendance.eventID + " entfernt");
    return await db.attendances.delete({
        where: {
            id: attendance.id
        }
    });
}

export default removeUserHandler;