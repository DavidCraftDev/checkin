"use server"

import { getSesessionUser } from "@/app/src/modules/authUtilities";
import { createEvent } from "@/app/src/modules/eventUtilities";
import { redirect } from "next/navigation";

let disabled = false;

export default async function submitHandler(formData: FormData) {
    if (disabled) return;
    if (!formData.get("name")) return;
    disabled = true;
    const name: string = String(formData.get("name"));
    const sessionUser = await getSesessionUser(1);
    const userID: string = sessionUser.id || "";
    const data = await createEvent(name, userID)
    redirect("/dashboard/events/event?id=" + data.id);
}