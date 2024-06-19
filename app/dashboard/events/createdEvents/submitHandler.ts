"use server"

import { getSessionUser } from "@/app/src/modules/authUtilities";
import { createEvent } from "@/app/src/modules/eventUtilities";
import { redirect } from "next/navigation";

let lastResult: string = "";

export default async function submitHandler(formData: FormData) {
    if (!formData.get("eventName")) return;
    const name: string = String(formData.get("eventName"));
    if (name === lastResult) return;
    lastResult = name;
    const studyTime: boolean = formData.get("type") === "studyTime";
    const sessionUser = await getSessionUser(1);
    const userID: string = sessionUser.id || "";
    const data = await createEvent(name, userID, studyTime);
    redirect("/dashboard/events/event?id=" + data.id);
}