'use client'

import { submitHandler } from "./submitHandler";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function CheckinForm(data: any) {
    const eventID = data.eventID
    const router = useRouter()
    async function eventHandler(formData: FormData) {
        if (!formData.get("name")) return;
        const data: any = await submitHandler(formData, eventID)
        if (data.startsWith("success")) {
            toast.success(formData.get("name") + " erfolgreich hinzugefügt")
            router.refresh()
            return
        }
        if (data === "ErrorNotFound") {
            toast.error("Nutzer nicht gefunden")
            return
        }
        if (data === "ErrorAlreadyCheckedIn") {
            toast.error("Nutzer bereits hinzugefügt")
            return
        }
        toast.error("Unbekannter Fehler")
        return
    }
    return (
        <form action={eventHandler} className="flex flex-col items-center flex-auto justify-center">
            <div>
                <label htmlFor="username">Nutzername</label><br />
                <input type="text" name="name" id="username" placeholder="max.musterschueler" className="rounded-full p-2 m-4 border-2 border-black-600" />
            </div>
            <div>
                <button type="submit" className="btn m-1">Hinzufügen</button>
                <a className="btn m-1" href={"/dashboard/events/event/qr?id=" + eventID}>QR-Scanner</a>
            </div>
        </form>
    )
}

export default CheckinForm;