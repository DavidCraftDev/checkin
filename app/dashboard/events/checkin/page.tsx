import { getServerSession } from "next-auth";
import { authOptions } from "@/app/src/modules/auth";
import { redirect } from "next/navigation";
import db from "@/app/src/modules/db";
import QRScanner from "./qrscanner.component";

interface SearchParams {
    id: string; 
  }

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
    const EventID = searchParams.id
    if(!EventID) {
        redirect("/dashboard/");
    }
    const event = await db.events.findUniqueOrThrow({
        where: {
            id: EventID
        }
    }).catch((error) => {
        console.error(error);
        redirect("/dashboard/");
    });
    if(event.user !== userID) {
        redirect("/dashboard/");
    }

    return (
        <div className="text-black">
            <p>Event</p>
            <p>{event.name}</p>
            <QRScanner onScan={(result) => console.log(result)} />
        </div>
    );
}