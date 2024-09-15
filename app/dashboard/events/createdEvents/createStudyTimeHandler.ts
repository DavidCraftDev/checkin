"use server"

import { disabledType } from "@/app/src/interfaces/utilties";
import { getSessionUser } from "@/app/src/modules/authUtilities";
import { createEvent } from "@/app/src/modules/eventUtilities";
import { redirect } from "next/navigation";

let disabled: disabledType = {};

async function createStudyTimeHandler(studyTimeType: string) {
    const sessionUser = await getSessionUser(1);
    if (disabled[sessionUser.id] && disabled[sessionUser.id] + 10000 > Date.now()) return;
    disabled[sessionUser.id] = Date.now();
    try {
        const data = await createEvent(studyTimeType.replace("parallel", "Vertretung"), sessionUser.id);
        if (data.id) redirect(`/dashboard/events/event?id=${data.id}`);
    } finally {
        delete disabled[sessionUser.id];
    }
}

export default createStudyTimeHandler;