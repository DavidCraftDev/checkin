"use server"

import db from "@/app/src/modules/db";
import { Attendances, User } from "@prisma/client";
import logger from "@/app/src/modules/logger";

async function removeUserHandler(attendance: Attendances, user: User, removeUser: User) {
    logger.info(user.displayname + " hat " + removeUser.displayname + " aus der Studienzeit mit der ID " + attendance.eventID + " entfernt", "Event");
    return await db.attendances.delete({
        where: {
            id: attendance.id
        }
    });
}

export default removeUserHandler;