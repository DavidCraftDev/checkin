"use server"

import { getSessionUser } from "@/app/src/modules/authUtilities";
import { createEvent } from "@/app/src/modules/eventUtilities";
import { redirect } from "next/navigation";

let lastResult: string = "";
let disabled: boolean = false;

export async function submitHandlerEvent(formData: FormData) {
    if (!formData.get("eventName")) return;
    const name: string = String(formData.get("eventName"));
    if (name === lastResult) return;
    lastResult = name;
    const sessionUser = await getSessionUser(1);
    const userID: string = sessionUser.id || "";
    const data = await createEvent(name, userID, false);
    redirect("/dashboard/events/event?id=" + data.id);
}

export async function submitHandlerStudyTime(formData: FormData) {
    if (!formData.get("studyTime")) return;
    if (disabled) return;
    disabled = true;
    const sessionUser = await getSessionUser(1);
    const userID: string = sessionUser.id || "";
    const studyTimeType: string = String(formData.get("studyTime"));
    const data = await createEvent("Studienzeit " + studyTimeType + " " + sessionUser.displayname, userID, true);
    redirect("/dashboard/events/event?id=" + data.id);
}