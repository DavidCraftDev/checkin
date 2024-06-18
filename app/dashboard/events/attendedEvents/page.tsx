import { getSessionUser } from "@/app/src/modules/authUtilities";
import { getAttendancesPerUser, getStudyTimes } from "@/app/src/modules/eventUtilities";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import CalendarWeek from "@/app/src/ui/calendarweek";
import moment from "moment";
import { notFound, redirect } from "next/navigation";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import AttendedEventTable from "./attendedEventsTable.component";
import { getNeededStudyTimes, getNeededStudyTimesForNotes, getNeededStudyTimesSelect, isStudyTimeEnabled } from "@/app/src/modules/studytimeUtilities";
import CreateStudyTimeNote from "./createStudyTimeNote.component";

export default async function attendedEvents({ searchParams }: { searchParams: SearchParams }) {
    const sessionUser = await getSessionUser();
    if (searchParams.userID && sessionUser.permission < 1) redirect("/dashboard");
    const userID = searchParams.userID || sessionUser.id;
    let userData;
    if (searchParams.userID) userData = await getUserPerID(userID);
    else userData = sessionUser;
    if (!userData.id) notFound();
    if (searchParams.userID && (sessionUser.permission < 2 && sessionUser.group !== userData.group)) redirect("/dashboard");

    const currentWeek: number = moment().week();
    const currentYear: number = moment().year();
    const cw: number = searchParams.cw || currentWeek;
    const year: number = searchParams.year || currentYear;
    if (cw > 53 || cw < 1 || year > currentYear) redirect("/dashboard/events/attendedEvents");
    if (year == currentYear && cw > currentWeek) redirect("/dashboard/events/attendedEvents");

    const data = await getAttendancesPerUser(userID, cw, year);
    let addable: boolean = false;
    if ((cw == currentWeek) && (year == currentYear)) addable = true;
    if ((searchParams.userID) && (searchParams.userID !== sessionUser.id)) addable = false;
    const studyTime: boolean = await isStudyTimeEnabled();
    const hasStudyTimes = await getStudyTimes(userData.id, cw, year).then((result) => result.length);
    const needsStudyTimes = await getNeededStudyTimes(userData.id).then((result) => result.length);
    const studyTimeTypes: any = {};
    if (studyTime) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].event.studyTime) {
                if (data[i].event.id !== "NOTE") {
                    studyTimeTypes[data[i].attendance.id] = await getNeededStudyTimesSelect(userData.id, data[i].eventUser.id)
                } else {
                    studyTimeTypes[data[i].attendance.id] = await getNeededStudyTimesForNotes(userData.id)
                }
            }
        }
    }
    return (
        <div>
            <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2">
                <div>
                    <h1>Teilgenommene Veranstalltungen</h1>
                    <p>von {userData.displayname}</p>
                    {studyTime ? <p>{hasStudyTimes} {hasStudyTimes == "1" ? "Studienzeit" : "Studienzeiten"}</p> : null}
                    {studyTime && addable && needsStudyTimes > hasStudyTimes ? <CreateStudyTimeNote userID={userData.id} cw={cw} /> : null}
                </div>
                <CalendarWeek searchParams={searchParams} />
            </div>
            <AttendedEventTable attendances={data} addable={addable} studyTime={studyTime} studyTimeTypes={studyTimeTypes} />
            <p>Exportieren als:
                <a href={"/export/events/attended/json?cw=" + cw + "&year=" + year + "&userID=" + userData.id} download={"attended_events" + cw + "_" + year + userData.id + ".json"} className="hover:underline mx-1">JSON</a>
                <a href={"/export/events/attended/xlsx?cw=" + cw + "&year=" + year + "&userID=" + userData.id} download={"attended_events" + cw + "_" + year + userData.id + ".xlsx"} className="hover:underline mx-1">XLSX</a>
            </p>
        </div>
    );
}