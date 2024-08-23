"use server";

import { deleteEmptyEvent } from "@/app/src/modules/eventUtilities";

export async function deleteEventHandler(eventID: string) {
    return await deleteEmptyEvent(eventID);
}