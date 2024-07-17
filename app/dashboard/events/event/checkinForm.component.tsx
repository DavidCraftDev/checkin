'use client'

import { submitHandler } from "./submitHandler";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";

interface CheckinFormProps {
    eventID: string
}

function CheckinForm(props: CheckinFormProps) {
    const router = useRouter()
    async function eventHandler(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        if (!formData.get("name")) return;
        const data: string | User = await submitHandler(formData.get("name") as string, props.eventID)
        if (typeof data === "string") {
            if (data === "ErrorNotFound") {
                toast.error("Nutzer nicht gefunden");
            } else if (data === "ErrorAlreadyCheckedIn") {
                toast.error("Nutzer bereits hinzugefügt");
            } else {
                toast.error("Unbekannter Fehler");
            }
        } else {
            if (data.username === formData.get("name")) {
                toast.success(`${data.displayname} erfolgreich hinzugefügt`);
                router.refresh();
            } else {
                toast.error("Unbekannter Fehler");
            }
        }
    }
    return (
        <form onSubmit={eventHandler} className="flex flex-col items-center flex-auto justify-center">
            <div>
                <label htmlFor="username">Nutzername</label><br />
                <input type="text" name="name" id="username" placeholder="max.musterschueler" className="rounded-full p-2 m-4 border-2 border-black-600" />
            </div>
            <div>
                <button type="submit" className="btn m-1">Hinzufügen</button>
                <a className="btn m-1" href={`/dashboard/events/event/qr?id=${props.eventID}`}>QR-Scanner</a>
            </div>
        </form>
    )
}

export default CheckinForm;