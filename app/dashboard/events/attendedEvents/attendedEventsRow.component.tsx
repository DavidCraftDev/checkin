"use client";

import { AttendancePerUserPerEvent } from "@/app/src/interfaces/events";
import dayjs from "dayjs";
import StudentNote from "./studentNote.component";
import TrafficLight from "./trafficLight";
import Link from "next/link";
import { setAttendanceType, setSelfReflection } from "./actions";
import { toast } from "sonner";
import { useState, useTransition } from "react";

function AttendedEventRow(props: { event: AttendancePerUserPerEvent, isEditable: boolean, studyTimeTypes: Record<string, string[]>, isTeacher: boolean }) {
    const { event, isEditable, studyTimeTypes, isTeacher } = props;
    const [isPending, startTransition] = useTransition();

    const changeType = (type: string) => {
        if (!isEditable) return;
        startTransition(async () => {
            const data = await setAttendanceType(event.attendance.id, type);
            if (data && data.success) {
                toast.success("Fach erfolgreich gespeichert");
            } else if (data && data.error) {
                toast.error(data.error);
            } else {
                toast.error("Ein unbekannter Fehler ist aufgetreten");
            }
        });
    };

    const changeReflection = (reflection: string) => {
        if (!isEditable) return;
        startTransition(async () => {
            const data = await setSelfReflection(event.attendance.id, reflection);
             if (data && data.success) {
                toast.success("Reflexion erfolgreich gespeichert");
            } else if (data && data.error) {
                toast.error(data.error);
            } else {
                toast.error("Ein unbekannter Fehler ist aufgetreten");
            }
        });
    };

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="py-3 px-6 text-gray-800 font-medium">
                {event.event.id === "NOTE" ?
                    <span className="text-gray-500 italic">Notiz</span> :
                    <Link href={"/dashboard/events/event?id=" + event.event.id} className="text-blue-600 hover:text-blue-800 hover:underline">{event.event.type}</Link>
                }
            </td>
            <td className="py-3 px-6 text-gray-600">
                {event.eventUser.id === event.attendance.userId ?
                    <span className="text-gray-400">Selbst</span> :
                    event.eventUser.displayname
                }
            </td>
            <td className="py-3 px-6 text-center">
                {event.event.id !== "NOTE" ? <TrafficLight status={event.attendance.feedback} /> : <span className="text-gray-300">-</span>}
            </td>
            <td className="py-3 px-6">
                {isEditable && studyTimeTypes[event.attendance.id] ? (
                    <select
                        defaultValue={event.attendance.type || "default"}
                        onChange={(e) => changeType(e.target.value)}
                        disabled={isPending}
                        className="bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-[200px]"
                    >
                        <option value="default" disabled>Bitte wählen...</option>
                        {studyTimeTypes[event.attendance.id].map((type) => (
                            <option key={type} value={type}>{type.replace("Vertretung:", "").replace("Notiz:", "")}</option>
                        ))}
                    </select>
                ) : (
                    <span className="text-gray-700 bg-gray-100 px-2 py-1 rounded-md text-sm">
                        {event.attendance.type ? event.attendance.type.replace("Vertretung:", "").replace("Notiz:", "") : "Kein Fach"}
                    </span>
                )}
            </td>
            <td className="py-3 px-6">
                 {isEditable ? <StudentNote attendance={event.attendance} /> : <span className="text-gray-600 text-sm max-w-xs truncate block" title={event.attendance.studentNote || ""}>{event.attendance.studentNote || "-"}</span>}
            </td>
            <td className="py-3 px-6">
                {isEditable && event.event.id !== "NOTE" ? (
                    <select
                        defaultValue={event.attendance.selfReflection || "default"}
                        onChange={(e) => changeReflection(e.target.value)}
                        disabled={isPending}
                        className="bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-[200px]"
                    >
                        <option value="default" disabled>Reflexion...</option>
                        <option value="👍">👍 Gut</option>
                        <option value="🆗">🆗 Okay</option>
                        <option value="👎">👎 Schlecht</option>
                    </select>
                ) : (
                    <span className="text-xl">{event.attendance.selfReflection || "❓"}</span>
                )}
            </td>
            <td className="py-3 px-6 text-gray-500 text-sm whitespace-nowrap">
                {dayjs(event.attendance.createdAt).format("DD.MM. HH:mm")}
            </td>
        </tr>
    )
}

export default AttendedEventRow;
