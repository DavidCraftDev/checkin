"use server"

import { getSessionUser } from "@/app/src/modules/authUtilities";
import { createEvent } from "@/app/src/modules/eventUtilities";
import moment from "moment";
import { redirect } from "next/navigation";

interface lastResultType {
    [key: string]: {
        lastName: string;
        lastTime: number;
    }
}

interface disabledType {
    [key: string]: {
        disabled: boolean;
        lastTime: number;
    }
}

let lastResult: lastResultType = {};
let disabled: disabledType = {};

export async function submitHandlerEvent(eventName: string) {
    const sessionUser = await getSessionUser(1);
    if (!lastResult[sessionUser.id]) lastResult[sessionUser.id] = { lastName: "", lastTime: 0 };
    let userLastResult = lastResult[sessionUser.id];
    if (eventName === userLastResult.lastName && moment().diff(moment(userLastResult.lastTime), "minutes") < 5) return;
    userLastResult.lastName = eventName;
    userLastResult.lastTime = Date.now();
    const userID: string = sessionUser.id || "";
    const data = await createEvent(eventName, userID, false);
    if (data.id) {
        redirect(`/dashboard/events/event?id=${data.id}`);
    }
}

export async function submitHandlerStudyTime(studyTimeType: string) {
    const sessionUser = await getSessionUser(1);
    if (!disabled[sessionUser.id]) disabled[sessionUser.id] = { disabled: false, lastTime: 0 };
    let userDisabled = disabled[sessionUser.id];
    if (userDisabled.disabled && moment().diff(moment(userDisabled.lastTime), "seconds") < 30) return;
    userDisabled.disabled = true;
    if (!disabled[sessionUser.id]) {
        disabled[sessionUser.id] = { disabled: false, lastTime: 0 };
    }
    userDisabled = disabled[sessionUser.id];
    userDisabled.lastTime = Date.now();
    const userID: string = sessionUser.id || "";
    const data = await createEvent("Studienzeit " + studyTimeType.replace("parallel", "Vertretung") + " " + sessionUser.displayname, userID, true).finally(() => {
        userDisabled.disabled = false;
    });
    if (data.id) {
        redirect(`/dashboard/events/event?id=${data.id}`);
    }
}