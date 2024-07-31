"use server"

import { createUserStudyTimeNote } from "@/app/src/modules/studytimeUtilities";

let isDisabled: boolean = false;

async function createStudyTimeNote(userID: string, cw: number) {
    if (isDisabled) return;
    isDisabled = true;
    await createUserStudyTimeNote(userID, cw);
    isDisabled = false;
}

export default createStudyTimeNote;