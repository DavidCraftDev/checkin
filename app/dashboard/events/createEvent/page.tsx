"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/src/modules/auth";
import { redirect } from "next/navigation";
import db from "@/app/src/modules/db";
import EventForm from "@/app/dashboard/events/createEvent/eventform.component";

export default async function createEvent() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.permission < 1)) {
        redirect("/api/auth/signin");
    }
    const user = await db.user.findUniqueOrThrow({
        where: {
            id: session.user.id
        }
    });
    const userPermission: number = user.permission || 0;
    if (userPermission < 1) {
        redirect("/dashboard");
    }
    const userID = user.id;

    return (
        <div className="text-black">
            <p>Veranstaltung erstellen</p>
            <EventForm/>
        </div>
    )
}

export async function submitHandler(formData: FormData) {
    "use server";
    if (!formData.get("name")) return;
    const name: string = String(formData.get("name"));
    const session = await getServerSession(authOptions);
    if (!session) return;
    const userID: string = session.user.id || "";
    console.log(name);
    console.log(userID);
    let data = await db.events.create({
        data: {
            name: name,
            user: userID,
            cw: 1,
        }
    });
    console.log(data);
}