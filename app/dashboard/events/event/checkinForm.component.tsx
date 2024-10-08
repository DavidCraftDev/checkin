'use client'

import { submitHandler } from "./checkinHandler";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Events, User } from "@prisma/client";
import SearchBar from "./search.component";
import dayjs from "dayjs";

interface CheckinFormProps {
    event: Events;
}

function CheckinForm(props: CheckinFormProps) {
    const router = useRouter()
    async function eventHandler(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        if(props.event.cw !== dayjs().isoWeek()) router.refresh();
        if (!formData.get("name")) return;
        const data: string | User = await submitHandler(formData.get("name") as string, props.event)
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
                <label htmlFor="username" className="ml-4">Nutzername</label><br />
                <SearchBar />
            </div>
            <div className="flex">
                <button type="submit" className="btn m-1">Hinzufügen</button>
                <a className="btn m-1" href={`/dashboard/events/event/qr?id=${props.event.id}`}>QR-Scanner</a>
            </div>
        </form>
    )
}

export default CheckinForm;