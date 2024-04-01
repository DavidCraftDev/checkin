import { getSesessionUser } from "@/app/src/modules/authUtilities";
import { getAttendancesPerUser } from "@/app/src/modules/eventUtilities";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import CalendarWeek from "@/app/src/ui/calendarweek";
import moment from "moment";
import { redirect } from "next/navigation";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import AttendedEventTable from "./attendedEventsTable.component";

export default async function attendedEvents({searchParams}: {searchParams: SearchParams}) {
    const sessionUser = await getSesessionUser();
    if(searchParams.userID && sessionUser.permission < 1) redirect("/dashboard");
    const userID = searchParams.userID || sessionUser.id;
    let userData;
    if(searchParams.userID) userData = await getUserPerID(userID);
    else userData = sessionUser;
    if(searchParams.userID && (sessionUser.permission < 2 && sessionUser.group !== userData.group)) redirect("/dashboard");

    const currentWeek: number = moment().week();
    const currentYear: number = moment().year();
    const cw: number = searchParams.cw || currentWeek;
    const year: number = searchParams.year || currentYear;
    if(cw > 53 || cw < 1 || year > currentYear) redirect("/dashboard/events/attendedEvents");
    if(year == currentYear && cw > currentWeek) redirect("/dashboard/events/attendedEvents");

    const data = await getAttendancesPerUser(userID, cw, year);
    let addable: boolean = false;
    if((cw == currentWeek) && (year == currentYear)) addable = true;
    if((searchParams.userID) && (searchParams.userID !== sessionUser.id)) addable = false;
            return (
        <div>
        <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2">
            <div>
                <h1>Teilgenommene Veranstalltungen</h1>
                <p>von { userData.displayname }</p>
            </div>
            <CalendarWeek searchParams={searchParams} />
        </div>
        <AttendedEventTable attendances={data} addable={addable} />
            <p>Export Soon™</p>
        </div>
    );
}