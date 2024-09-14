"use server"

import { disabledType } from "@/app/src/interfaces/utilties";
import { createUserStudyTimeNote } from "@/app/src/modules/studytimeUtilities";

let disabled: disabledType = {};

async function createStudyTimeNote(userID: string, cw: number) {
    if (disabled[userID] && disabled[userID] + 10000 > Date.now()) return;
    disabled[userID] = Date.now();
    try {
        await createUserStudyTimeNote(userID, cw);
    } finally {
        delete disabled[userID]
    }
}

export default createStudyTimeNote;