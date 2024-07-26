import { getSessionUser } from "@/app/src/modules/authUtilities";
import { getAttendancesPerUser, getStudyTimes } from "@/app/src/modules/eventUtilities";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import CalendarWeek from "@/app/src/ui/calendarweek";
import moment from "moment";
import { notFound, redirect } from "next/navigation";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import AttendedEventTable from "./attendedEventsTable.component";
import { getMissingStudyTimes, getNeededStudyTimes, getNeededStudyTimesForNotes, getNeededStudyTimesSelect, getSavedMissingStudyTimes } from "@/app/src/modules/studytimeUtilities";
import CreateStudyTimeNote from "./createStudyTimeNote.component";
import { studytime } from "@/app/src/modules/config";

async function attendedEvents({ searchParams }: { searchParams: SearchParams }) {
    const sessionUser = await getSessionUser();
    if (searchParams.userID && sessionUser.permission < 1) redirect("/dashboard");
    const userID = searchParams.userID || sessionUser.id;
    const userData = searchParams.userID ? await getUserPerID(userID) : sessionUser;
    if (!userData.id) notFound();
    if (searchParams.userID && (sessionUser.permission < 2 && sessionUser.group !== userData.group)) redirect("/dashboard");

    const currentWeek = moment().week();
    const currentYear = moment().year();
    const cw = searchParams.cw || currentWeek;
    const year = searchParams.year || currentYear;
    if (cw > 53 || cw < 1 || year > currentYear) redirect("/dashboard/events/attendedEvents");
    if (year == currentYear && cw > currentWeek) redirect("/dashboard/events/attendedEvents");

    const [
        data,
        hasStudyTimes,
        needsStudyTimes
    ] = await Promise.all([
        getAttendancesPerUser(userID, cw, year),
        getStudyTimes(userData.id, cw, year).then(result => result.length),
        getNeededStudyTimes(userData.id).then(result => result.length)
    ]);

    let addable = (cw === currentWeek && year === currentYear);
    if (searchParams.userID && searchParams.userID !== sessionUser.id) addable = false;

    let missingStudyTimes: string[] = [];
    const studyTimeTypes: Record<string, string[]> = {};

    if (studytime) {
        for (const event of data) if (event.event.studyTime) studyTimeTypes[event.attendance.id] = event.event.id !== "NOTE" ? await getNeededStudyTimesSelect(userData.id, event.eventUser.id) : await getNeededStudyTimesForNotes(userData.id);
        missingStudyTimes = addable ? await getMissingStudyTimes(userData.id) : await getSavedMissingStudyTimes(userData.id, cw, year) || [];
    }

    return (
        <div>
            <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2">
                <div>
                    <h1>Teilgenommene Veranstaltungen</h1>
                    <p>von {userData.displayname}</p>
                    {studytime && needsStudyTimes ? <p>{hasStudyTimes} {hasStudyTimes == 1 ? "Studienzeit" : "Studienzeiten"}</p> : null}
                    {studytime && needsStudyTimes && missingStudyTimes.length > 0 ? <p>Fehlende Studienzeiten: {missingStudyTimes.join(", ")} ({missingStudyTimes.length})</p> : null}
                    {studytime && addable && needsStudyTimes > hasStudyTimes ? <CreateStudyTimeNote userID={userData.id} cw={cw} /> : null}
                </div>
                <CalendarWeek searchParams={searchParams} />
            </div>
            <AttendedEventTable attendances={data} addable={addable} studyTime={studytime} studyTimeTypes={studyTimeTypes} />
            <p>Exportieren als:
                <a href={`/export/events/attended/json?cw=${cw}&year=${year}&userID=${userData.id}`} download={`attended_events${cw}_${year}${userData.id}.json`} className="hover:underline mx-1">JSON</a>
                <a href={`/export/events/attended/xlsx?cw=${cw}&year=${year}&userID=${userData.id}`} download={`attended_events${cw}_${year}${userData.id}.xlsx`} className="hover:underline mx-1">XLSX</a>
            </p>
        </div>
    );
}

export default attendedEvents;