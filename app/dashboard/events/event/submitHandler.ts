"use server"

import { getSesessionUser } from "@/app/src/modules/authUtilities";
import { checkINHandler, getEventPerID } from "@/app/src/modules/eventUtilities";
import { getUserID } from "@/app/src/modules/userUtilities";

export async function submitHandler(formData: FormData, eventID: string) {
    if (!formData.get("name")) return;
    const name: string = String(formData.get("name"));
    const sessionUser = await getSesessionUser(1);
    const event = await getEventPerID(eventID);
    if (event.user !== sessionUser.id) return;
    const userID: string = await getUserID(name);
    const data = await checkINHandler(eventID, userID)
    return data;
}