"use client";

import { useRouter } from "next/navigation";
import { handleEventDelete, handleUserCheckIN, removeUserHandler, saveSelectedStudyTimeFeedback } from "./actions";
import { Attendances, Events, User } from "@prisma/client";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { toast } from "sonner";
import SearchBar from "./search.component";
import { SubmitButton } from "@/app/src/ui/submitButton";
import { useState, useTransition } from "react";

dayjs.extend(isoWeek);

export function DeleteEventButton(props: { eventID: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <p className="text-center">
            <button
                onClick={() => startTransition(() => handleEventDelete(props.eventID))}
                disabled={isPending}
                className="btn bg-red-700 hover:bg-red-900 m-2 mt-0 text-center disabled:opacity-50 transition-colors"
            >
                {isPending ? "Lösche..." : "Studienzeit löschen"}
            </button>
        </p>
    )
}

export function RemoveUserButton(props: { attendance: Attendances, user: User, removeUser: User }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    async function removeUserManager() {
        if (props.attendance.cw !== dayjs().isoWeek() || dayjs(props.attendance.created_at).year() !== dayjs().year()) return router.refresh();
        if (!confirm("Möchtest du " + props.removeUser.displayname + " wirklich entfernen?")) return;

        startTransition(async () => {
            const data = await removeUserHandler(props.attendance.id, props.attendance.eventID);
            if (data && data.success) {
                toast.success(props.removeUser.displayname + " erfolgreich entfernt");
                router.refresh();
            } else {
                toast.error(data?.error || "Fehler beim Entfernen");
            }
        });
    }

    return (
        <td>
            <button
                onClick={removeUserManager}
                disabled={isPending}
                className="btn text-nowrap bg-red-700 hover:bg-red-900 text-xs px-2 py-1 disabled:opacity-50 transition-colors rounded"
            >
                {isPending ? "..." : "Entfernen"}
            </button>
        </td>
    );
}

export function CheckinForm(props: { event: Events }) {
    const router = useRouter();

    async function eventHandler(formData: FormData) {
        if (props.event.cw !== dayjs().isoWeek() || dayjs(props.event.created_at).year() !== dayjs().year()) {
            router.refresh();
            return;
        }
        const username = formData.get("name") as string;
        if (!username) return;

        const data = await handleUserCheckIN(username, props.event.id);

        if (data && data.success && data.data) {
            toast.success(`${data.data.displayname} erfolgreich hinzugefügt`);
            router.refresh();
        } else if (data && data.error) {
            toast.error(data.error);
        } else {
            toast.error("Unbekannter Fehler");
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm w-full max-w-lg mx-auto my-4 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">Schüler hinzufügen</h2>
            <form action={eventHandler} className="flex flex-col gap-4">
                <div className="w-full">
                    <label htmlFor="username" className="text-sm text-gray-600 mb-1 block pl-1">Nutzername</label>
                    <SearchBar />
                </div>
                <div className="flex gap-3 justify-center mt-2">
                    <div className="flex-1">
                        <SubmitButton text="Hinzufügen" className="bg-green-600 hover:bg-green-700 text-white w-full h-full" />
                    </div>
                    <a className="btn bg-blue-600 hover:bg-blue-700 text-white flex-1 text-center flex items-center justify-center rounded-md px-4 py-2 transition-colors" href={`/dashboard/events/event/qr?id=${props.event.id}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                        </svg>
                        QR-Scanner
                    </a>
                </div>
            </form>
        </div>
    )
}

export function TrafficLightSelect(props: { attendance: Attendances }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    async function submitTrafficLightSelect(feedback: string): Promise<void> {
        startTransition(async () => {
            const data = await saveSelectedStudyTimeFeedback(props.attendance.id, feedback.toUpperCase() as "GREEN" | "RED" | "YELLOW", props.attendance.userID);
            if (data && data.success) {
                toast.success("Feedback gespeichert");
                router.refresh();
            } else if (data && data.error) {
                toast.error(data.error);
            } else {
                toast.error("Ein unbekannter Fehler ist aufgetreten");
            }
        });
    }

    const colorClass = {
        "GREEN": "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
        "YELLOW": "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
        "RED": "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
        "default": "bg-gray-50 border-gray-200 hover:bg-gray-100"
    }[props.attendance.feedback || "default"];

    return (
        <div className="relative w-full min-w-[140px]">
             <select
                className={`appearance-none border-2 rounded-md p-2 pl-3 pr-8 w-full cursor-pointer transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${colorClass} ${isPending ? 'opacity-50 cursor-wait' : ''}`}
                defaultValue={props.attendance.feedback || "default"}
                onChange={(event) => submitTrafficLightSelect(event.target.value)}
                disabled={isPending}
            >
                <option disabled value="default">Feedback wählen</option>
                <option value="RED">🛑 Rot</option>
                <option value="YELLOW">⚠️ Gelb</option>
                <option value="GREEN">✅ Grün</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    );
}
