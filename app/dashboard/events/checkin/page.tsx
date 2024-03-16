"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/src/modules/auth";
import { redirect } from "next/navigation";
import db from "@/app/src/modules/db";
import QRScanner from './qrscanner.component';
import UsernameForm from "./usernameform.component";

type SearchParams = {
    id: string;
    userID: string;
  };

let eventIDFunction: string

export default async function checkIN({searchParams}: {searchParams: SearchParams}) {
    const session = await  getServerSession(authOptions);
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
    const eventID = searchParams.id;
    const test = searchParams.userID;
    eventIDFunction = eventID;
    if(test) {
        let checkInDatat = await checkInUser(test, eventID)
        console.log(checkInDatat);
    }
    const event = await db.events.findUniqueOrThrow({
        where: {
            id: eventID
        }
    }).catch((error) => {
        console.error(error);
        redirect("/dashboard/");
    });
    console.log(event);
    const date = new Date(event.created_at);
    console.log(date.getFullYear());
    if(event.user !== userID) {
        redirect("/dashboard/");
    }
    return (
        <div className="text-black">
            <p>Event</p>
            <p>{event.name}</p>
            <p>{test}</p>
            <QRScanner />
            <UsernameForm />
        </div>
    );
}

export async function submitHandler(formData: FormData) {
    "use server";
    if (!formData.get("name")) return;
    const name: string = String(formData.get("name"));
    const session = await getServerSession(authOptions);
    if (!session) return;
    let data = await db.user.findUniqueOrThrow({
        where: {
            username: name
        }
    }).catch((error) => {
        console.error(error);
        return;
    });
    console.log(data);
    const userID: string = data.id;
    redirect("/dashboard/events/checkin?id=" + eventIDFunction + "&userID=" + userID);
}

async function checkInUser(userID: string, eventID: string) {
    "use server";
    let existAttendance = await db.attendance.count({
        where: {
            eventID: eventID,
            userID: userID,
        }
    });
    if(existAttendance > 0) return "Error:Already"
    let existUser = await db.user.count({
        where: {
            id: userID,
        }
    });
    if(existUser < 1) return "Error:User"
    let existEvent = await db.events.count({
        where: {
            id: eventID,
        }
    });
    if(existEvent < 1) return "Error:Event"
    await db.attendance.create({
        data: {
            eventID: eventID,
            userID: userID,
            cw: 1,
        }
    });
    return "Success:" + userID;
}