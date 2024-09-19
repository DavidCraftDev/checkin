"use server"

import { disabledType } from "@/app/src/interfaces/utilties";
import { createUserStudyTimeNote } from "@/app/src/modules/studytimeUtilities";

let disabled: disabledType = {};

async function createStudyTimeNote(userID: string, cw: number) {
    if (disabled[userID] && disabled[userID] + 5000 > Date.now()) return 2;
    disabled[userID] = Date.now();
    try {
        return + await createUserStudyTimeNote(userID, cw);
    } finally {
        delete disabled[userID]
    }
}

export default createStudyTimeNote;