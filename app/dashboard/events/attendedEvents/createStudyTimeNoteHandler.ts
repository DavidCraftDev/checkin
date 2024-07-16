"use server"

import { createUserStudyTimeNote } from "@/app/src/modules/studytimeUtilities";

let isDisabled: boolean = false;

async function createStudyTimeNote(userID: string, cw: number) {
    if (isDisabled) return;
    isDisabled = true;
    try {
        await createUserStudyTimeNote(userID, cw);
    } catch (error) {
        console.error("Error creating study time note:", error);
    } finally {
        isDisabled = false;
    }
}

export default createStudyTimeNote;