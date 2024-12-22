"use client";

import { useRouter } from "next/navigation";
import { handleEventDelete, handleUserCheckIN, removeUserHandler } from "./actions";
import { Attendances, Events, User } from "@prisma/client";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import toast from "react-hot-toast";
import SearchBar from "./search.component";
import { SubmitButton } from "@/app/src/ui/submitButton";

dayjs.extend(isoWeek);

export function DeleteEventButton(props: { eventID: string }) {
    return (
        <p className="text-center">
            <button onClick={() => handleEventDelete(props.eventID)} className="btn bg-red-700 hover:bg-red-900 m-2 mt-0 text-center">Studienzeit löschen</button>
        </p>
    )
}

export function RemoveUserButton() {
    const router = useRouter();
    function removeUser() {

    }
    return (
        <td>
            <button onClick={() => removeUser()} className="btn bg-red-700 hover:bg-red-900">Schüler entfernen</button>
        </td>
    );
}

export function CheckinForm(props: { event: Events }) {
    const router = useRouter();
    async function eventHandler(formData: FormData) {
        if(props.event.cw !== dayjs().isoWeek() || dayjs(props.event.created_at).year() !== dayjs().year()) router.refresh();
        if (!formData.get("name")) return;
        const data = await handleUserCheckIN(formData.get("name") as string, props.event)
        if(data.success && data.data) {
            toast.success(`${data.data.displayname} erfolgreich hinzugefügt`);
            router.refresh();
        } else if(data.error) {
            toast.error(data.error);
        } else {
            toast.error("Unbekannter Fehler");
        }
    }
    return (
        <form action={eventHandler} className="flex flex-col items-center flex-auto justify-center">
            <div>
                <label htmlFor="username" className="ml-4">Nutzername</label><br />
                <SearchBar />
            </div>
            <div className="flex">
                <span className="w-fit m-1"><SubmitButton text="Hinzufügen" /></span>
                <a className="btn m-1" href={`/dashboard/events/event/qr?id=${props.event.id}`}>QR-Scanner</a>
            </div>
        </form>
    )
}

export function RemoveUser(props: { user: User, removeUser: User, attendance: Attendances }) {
    const router = useRouter();
    async function removeUser() {
        if (props.attendance.cw !== dayjs().isoWeek() || dayjs(props.attendance.created_at).year() !== dayjs().year()) return router.refresh();
        if (!confirm("Möchtest du den Nutzer wirklich löschen?")) return;
        const data = await removeUserHandler(props.attendance, props.user, props.removeUser);
        if (data.id && data.id === props.attendance.id) toast.success("Nutzer erfolgreich entfernt");
        else toast.error("Fehler beim entfernen des Nutzers");
        router.refresh();
    }
    return (
        <td>
            <button onClick={() => removeUser()} className="btn bg-red-700 hover:bg-red-900">Nutzer entfernen</button>
        </td>
    );
}