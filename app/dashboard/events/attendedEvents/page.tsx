import { getSesessionUser } from "@/app/src/modules/authUtilities";
import { getAttendancesPerUser } from "@/app/src/modules/eventUtilities";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import CalendarWeek from "@/app/src/ui/calendarweek";
import moment from "moment";
import { redirect } from "next/navigation";
import { SearchParams } from "@/app/src/interfaces/searchParams";

export default async function attendedEvents({searchParams}: {searchParams: SearchParams}) {
    const sessionUser = await getSesessionUser();
    if(searchParams.userID && sessionUser.permission < 1) redirect("/dashboard");
    const userID = searchParams.userID || sessionUser.id;
    let userData;
    if(searchParams.userID) userData = await getUserPerID(userID);
    else userData = sessionUser;
    if(searchParams.userID && (sessionUser.permission < 2 && sessionUser.group !== userData.group)) redirect("/dashboard");

    const currentWeek = moment().week();
    const currentYear = moment().year();
    const cw = searchParams.cw || currentWeek;
    const year = searchParams.year || currentYear;
    if(cw > 53 || cw < 1 || year > currentYear) redirect("/dashboard/events/attendedEvents");
    if(year == currentYear && cw > currentWeek) redirect("/dashboard/events/attendedEvents");

    const data = await getAttendancesPerUser(userID, cw, year);
    return (
        <div>
            <h1>Teilgenomme Veranstalltungen</h1>
            <div>von { userData.displayname }</div>
            <CalendarWeek searchParams={searchParams} />
            <div className="w-full mt-4 p-2 pb-0 border-gray-200 border-2 rounded-md">
            <table className="table-auto w-full text-left">
                <thead>
                    <tr className="border-b border-gray-600">
                        <th className="py-4 px-2">Name</th>
                        <th className="py-4 px-2">Lehrer</th>
                        <th className="py-4 px-2">Zeit</th>
                    </tr>
                </thead>
                <tbody>
                {data.map((event: any) => (
                    <tr key={event.attendance.id} className="border-b border-gray-200">
                        <td className="p-2">{event.event.name}</td>
                        <td className="p-2">{event.eventUser.displayname}</td>
                        <td className="p-2">{moment(Date.parse(event.attendance.created_at)).format("DD.MM.YYYY HH:mm")}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
            <p>Export Soon™</p>
        </div>
    );
}