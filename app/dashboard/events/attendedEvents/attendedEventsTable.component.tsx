import { AttendancePerUserPerEvent } from "@/app/src/interfaces/events";
import AttendedEventRow from "./attendedEventsRow.component";

interface AttendedEventTableProps {
    attendances: AttendancePerUserPerEvent[],
    isEditable: boolean,
    studyTimeTypes: Record<string, string[]>,
    isTeacher: boolean
}

function AttendedEventTable(props: AttendedEventTableProps) {
    return (
        <div className="w-full mt-6 bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-max">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="py-4 px-6 font-semibold text-gray-700 text-xs uppercase tracking-wider">Studienzeit</th>
                            <th className="py-4 px-6 font-semibold text-gray-700 text-xs uppercase tracking-wider">Leitung</th>
                            <th className="py-4 px-6 font-semibold text-gray-700 text-xs uppercase tracking-wider text-center">Ampel</th>
                            <th className="py-4 px-6 font-semibold text-gray-700 text-xs uppercase tracking-wider">Fach</th>
                            <th className="py-4 px-6 font-semibold text-gray-700 text-xs uppercase tracking-wider">Notiz</th>
                            <th className="py-4 px-6 font-semibold text-gray-700 text-xs uppercase tracking-wider">Selbstreflexion</th>
                            <th className="py-4 px-6 font-semibold text-gray-700 text-xs uppercase tracking-wider">Zeit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {props.attendances.map((attendance: AttendancePerUserPerEvent) => (
                            <AttendedEventRow key={attendance.attendance.id} event={attendance} isEditable={props.isEditable} studyTimeTypes={props.studyTimeTypes} isTeacher={props.isTeacher} />
                        ))}
                    </tbody>
                </table>
            </div>
            {props.attendances.length === 0 && (
                 <div className="text-center py-12 bg-gray-50 flex flex-col items-center justify-center">
                    <p className="text-gray-500 text-lg">Keine Studienzeiten besucht</p>
                </div>
            )}
        </div>
    )
}

export default AttendedEventTable;
