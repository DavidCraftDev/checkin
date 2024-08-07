"use server"

import { getSessionUser } from "@/app/src/modules/authUtilities";
import { createEvent } from "@/app/src/modules/eventUtilities";
import { redirect } from "next/navigation";

let lastResult: string = "";
let disabled: boolean = false;

export async function submitHandlerEvent(eventName: string) {
    if (eventName === lastResult) return;
    lastResult = eventName;
    const sessionUser = await getSessionUser(1);
    const userID: string = sessionUser.id || "";
    const data = await createEvent(eventName, userID, false);
    if (data.id) {
        redirect(`/dashboard/events/event?id=${data.id}`);
    }
}

export async function submitHandlerStudyTime(studyTimeType: string) {
    if (disabled) return;
    disabled = true;
    const sessionUser = await getSessionUser(1);
    const userID: string = sessionUser.id || "";
    const data = await createEvent("Studienzeit " + studyTimeType.replace("parallel", "Vertretung") + " " + sessionUser.displayname, userID, true);
    disabled = false;
    if (data.id) {
        redirect(`/dashboard/events/event?id=${data.id}`);
    }
}