import { getServerSession } from "next-auth";
import { authOptions } from "@/app/src/modules/auth";
import { redirect } from "next/navigation";
import db from "@/app/src/modules/db";
import { getSesessionUser } from "@/app/src/modules/authUtilities";
import { getAttendancesPerEvent, getEventPerID } from "@/app/src/modules/eventUtilities";
import moment from "moment";

interface SearchParams {
    id: string; 
  }

export default async function event({searchParams}: {searchParams: SearchParams}) {
    const user = await getSesessionUser(1);
    const userPermission: number = user.permission || 0;
    const userID = user.id;
    const EventID = searchParams.id
    if(!EventID) redirect("/dashboard/");
    const event = await getEventPerID(EventID);
    if(!event.id) redirect("/dashboard/");
    if(event.user !== userID) redirect("/dashboard/");
    const attendances = await getAttendancesPerEvent(EventID);
    const attendanceCount = attendances.length;
    return (
        <div>
            <h1>Veranstalltung: {event.name}</h1>
            <p>erstellt am {moment(Date.parse(event.created_at)).format("DD.MM.YYYY HH:mm")} in Kalenderwoche {event.cw}</p>
            <p>{attendanceCount} Teilnehmer</p>
            <div className="w-full mt-4 p-2 pb-0 border-gray-200 border-2 rounded-md">
            <table className="table-auto w-full text-left">
                <thead>
                    <tr className="border-b border-gray-600">
                        <th className="py-4 px-2">Name</th>
                        <th className="py-4 px-2">Wann hinzugefügt</th>
                    </tr>
                </thead>
                <tbody>
                {attendances.map((attendance: any) => (
                    <tr key={attendance.attendance.id} className="border-b border-gray-200">
                        <td className="p-2">{attendance.user.displayname}</td>
                        <td className="p-2">{moment(Date.parse(attendance.attendance.created_at)).format("DD.MM.YYYY HH:mm")}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
            <p>Export Soon™</p>
        </div>
    );
}