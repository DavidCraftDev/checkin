"use server";

import TeacherNote from "./teacherNote.component";
import { AttendancePerEventPerUser } from "@/app/src/interfaces/events";
import dayjs from "dayjs";
import { User } from "@prisma/client";
import { DeleteEventButton, RemoveUserButton, TrafficLightSelect } from "./forms";

interface EventTableProps {
    attendances: AttendancePerEventPerUser[],
    user: User,
    eventID: string,
    addable: boolean
}

function EventTable(props: EventTableProps) {
    return (
        <div className="w-full mt-6 bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-max">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="py-4 px-6 font-semibold text-gray-700 text-xs uppercase tracking-wider">Name</th>
                            <th className="py-4 px-6 font-semibold text-gray-700 text-xs uppercase tracking-wider">Fach</th>
                            <th className="py-4 px-6 font-semibold text-gray-700 text-xs uppercase tracking-wider">Schüler Notiz</th>
                            <th className="py-4 px-6 font-semibold text-gray-700 text-xs uppercase tracking-wider">Lehrer Notiz</th>
                            <th className="py-4 px-6 font-semibold text-gray-700 text-xs uppercase tracking-wider text-center">Ampel</th>
                            <th className="py-4 px-6 font-semibold text-gray-700 text-xs uppercase tracking-wider">Reflexion</th>
                            <th className="py-4 px-6 font-semibold text-gray-700 text-xs uppercase tracking-wider">Zeit</th>
                            {props.addable ? <th className="py-4 px-6 font-semibold text-gray-700 text-xs uppercase tracking-wider text-center">Aktionen</th> : null}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {props.attendances.map((attendance: AttendancePerEventPerUser) => (
                            <tr key={attendance.attendance.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-6 text-gray-800 font-medium">{attendance.user.displayname}</td>
                                <td className="py-3 px-6 text-gray-600">
                                    {attendance.attendance.type ?
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{attendance.attendance.type}</span>
                                        : <span className="text-gray-400 italic text-sm">Kein Fach</span>
                                    }
                                </td>
                                <td className="py-3 px-6 text-gray-600 text-sm max-w-xs truncate" title={attendance.attendance.studentNote || ""}>{attendance.attendance.studentNote || "-"}</td>
                                <td className="py-3 px-6">
                                    {props.addable ? <TeacherNote attendance={attendance.attendance} /> : <span className="text-gray-600 text-sm">{attendance.attendance.teacherNote || "-"}</span>}
                                </td>
                                <td className="py-3 px-6 text-center"><TrafficLightSelect attendance={attendance.attendance} /></td>
                                <td className="py-3 px-6 text-gray-600 text-sm max-w-xs truncate" title={attendance.attendance.selfReflection || ""}>{attendance.attendance.selfReflection || "-"}</td>
                                <td className="py-3 px-6 text-gray-500 text-sm whitespace-nowrap">{dayjs(attendance.attendance.createdAt).format("DD.MM. HH:mm")}</td>
                                {props.addable ? <RemoveUserButton user={props.user} attendance={attendance.attendance} removeUser={attendance.user} /> : null}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {props.attendances.length === 0 && (
                <div className="text-center py-12 bg-gray-50 flex flex-col items-center justify-center">
                    <p className="text-gray-500 mb-6 text-lg">Keine Schüler anwesend</p>
                    <DeleteEventButton eventID={props.eventID} />
                </div>
            )}
        </div>
    )
}

export default EventTable;
