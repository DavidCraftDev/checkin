"use client";

import { useRouter } from "next/navigation";
import { handleEventDelete, handleUserCheckIN, removeUserHandler, saveSelectedStudyTimeFeedback } from "./actions";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { toast } from "sonner";
import SearchBar from "./search.component";
import { SubmitButton } from "@/app/src/ui/submitButton";
import { Attendances, Events, User } from "@/app/src/modules/db";

dayjs.extend(isoWeek);

export function DeleteEventButton(props: { eventID: string }) {
    return (
        <p className="text-center">
            <button onClick={() => handleEventDelete(props.eventID)} className="btn bg-red-700 hover:bg-red-900 m-2 mt-0 text-center">Studienzeit löschen</button>
        </p>
    )
}

export function RemoveUserButton(props: { attendance: Attendances, user: User, removeUser: User }) {
    const router = useRouter();
    async function removeUserManager() {
        if (props.attendance.cw !== dayjs().isoWeek() || dayjs(props.attendance.created_at).year() !== dayjs().year()) return router.refresh();
        if (!confirm("Möchtest du " + props.removeUser.displayname + " wirklich entfernen?")) return;
        const data = await removeUserHandler(props.attendance, props.user, props.removeUser);
        if (data && data.id === props.attendance.id) toast.success(props.removeUser.displayname + " wurde aus den Akten getilgt");
        else toast.error("Die Akten weigern sich, " + props.removeUser.displayname + " freizugeben");
        router.refresh();
    }
    return (
        <td>
            <button onClick={removeUserManager} className="btn text-nowrap bg-red-700 hover:bg-red-900">Schüler entfernen</button>
        </td>
    );
}

export function CheckinForm(props: { event: Events }) {
    const router = useRouter();
    async function eventHandler(formData: FormData) {
        if (props.event.cw !== dayjs().isoWeek() || dayjs(props.event.created_at).year() !== dayjs().year()) router.refresh();
        if (!formData.get("name")) return;
        const data = await handleUserCheckIN(formData.get("name") as string, props.event)
        if (data && data.success && data.data) {
            toast.success(`${data.data.displayname} wurde in die Registratur aufgenommen`);
            router.refresh();
        } else if (data && data.error) {
            toast.error(data.error);
        } else {
            toast.error("Ein Fehler ohne Namen und Gesicht ist erschienen");
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
                <a className="btn m-1" href={`/dashboard/events/event/${props.event.id}/qr`}>QR-Scanner</a>
            </div>
        </form>
    )
}

// Trafic Light Attendance Feedback Select Component
export function TrafficLightSelect(props: { attendance: Attendances }) {
    const router = useRouter();
    async function submitTrafficLightSelect(feedback: string): Promise<void> {
        const data = await saveSelectedStudyTimeFeedback(props.attendance.id, feedback.toUpperCase() as "GREEN" | "RED" | "YELLOW", props.attendance.userID);
        if (data && data.success) {
            toast.success("Dein Urteil wurde in die Akten eingetragen");
        } else if (data && data.error) {
            toast.error(data.error);
        } else {
            toast.error("Ein namenloser Fehler hat sich aus den Tiefen des Systems erhoben");
        }
        router.refresh();
    }
    return (
        <select className="border-gray-200 border-2 rounded-md p-2.5 bg-white" defaultValue={props.attendance.feedback || "default"} onChange={(event) => submitTrafficLightSelect(event.target.value)}>
            <option disabled value="default">Feedback wählen</option>
            <option value="RED">Rot</option>
            <option value="YELLOW">Gelb</option>
            <option value="GREEN">Grün</option>
        </select>
    );
}