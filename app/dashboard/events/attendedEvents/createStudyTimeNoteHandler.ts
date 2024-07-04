"use server"

import { createUserStudyTimeNote } from "@/app/src/modules/studytimeUtilities";

let disabled: boolean = false;

async function createNote(userID: string, cw: number) {
    if (disabled) return;
    disabled = true;
    await createUserStudyTimeNote(userID, cw);
    disabled = false;
}

export default createNote;