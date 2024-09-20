import { getSessionUser } from "@/app/src/modules/authUtilities";
import { getAttendancesPerUser } from "@/app/src/modules/eventUtilities";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import CalendarWeek from "@/app/src/ui/calendarweek";
import { notFound, redirect } from "next/navigation";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import AttendedEventTable from "./attendedEventsTable.component";
import { getNeededStudyTimesForNotes, getNeededStudyTimesSelect, getSavedNeededStudyTimes, saveNeededStudyTimes } from "@/app/src/modules/studytimeUtilities";
import CreateStudyTimeNote from "./createStudyTimeNote.component";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";

dayjs.extend(isoWeek)
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)

async function attendedEvents({ searchParams }: { searchParams: SearchParams }) {
    const sessionUser = await getSessionUser();
    if (searchParams.userID && sessionUser.permission < 1) redirect("/dashboard");
    const userID = searchParams.userID || sessionUser.id;
    const userData = searchParams.userID ? await getUserPerID(userID) : sessionUser;
    if (!userData.id) notFound();
    if (searchParams.userID && (sessionUser.permission < 2 && sessionUser.group.filter(value => userData.group.includes(value)).length === 0)) redirect("/dashboard");

    const currentWeek = dayjs().isoWeek();
    const currentYear = dayjs().year();
    const cw = Number(searchParams.cw) || currentWeek;
    const year = Number(searchParams.year) || currentYear;
    if (cw > dayjs().year(year).isoWeeksInYear() || cw < 1 || year > currentYear) redirect("/dashboard/events/attendedEvents");
    if (year == currentYear && cw > currentWeek) redirect("/dashboard/events/attendedEvents");

    const attendances = await getAttendancesPerUser(userID, cw, year);
    const completedStudyTimesCount = attendances.filter((attendance) => attendance.event.type !== null).length;

    let addable = (cw === currentWeek && year === currentYear);

    const studyTimeTypes: Record<string, string[]> = {};
    for (const event of attendances) studyTimeTypes[event.attendance.id] = event.event.id !== "NOTE" ? await getNeededStudyTimesSelect(userData, event.eventUser, attendances) : await getNeededStudyTimesForNotes(userData, attendances);

    let userNeeds = addable ? userData.needs : (await (getSavedNeededStudyTimes(userData, cw, year))).needs;
    if (addable) saveNeededStudyTimes(userData);
    let missingStudyTimes: Array<string> = new Array();
    userNeeds.forEach((neededStudyTime) => { if (!attendances.find((attendanceData) => attendanceData.attendance.type && attendanceData.attendance.type.replace("Vertretung:", "").replace("Notiz:", "") === neededStudyTime)) missingStudyTimes.push(neededStudyTime) });

    if (sessionUser.id !== userData.id) addable = true;
    return (
        <div>
            <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2">
                <div>
                    <h1>Teilgenommene Studienzeiten</h1>
                    <p>von {userData.displayname}</p>
                    {userData.needs.length ? <p>{completedStudyTimesCount} {completedStudyTimesCount == 1 ? "Studienzeit" : "Studienzeiten"}</p> : null}
                    {userData.needs.length && missingStudyTimes.length > 0 ? <p>Fehlende Studienzeiten: {missingStudyTimes.join(", ")} ({missingStudyTimes.length})</p> : null}
                    {addable && userData.needs.length > completedStudyTimesCount ? <CreateStudyTimeNote userID={userData.id} cw={cw} /> : null}
                </div>
                <CalendarWeek />
            </div>
            <AttendedEventTable attendances={attendances} addable={addable} studyTimeTypes={studyTimeTypes} />
            <p>Exportieren als:
                <a href={`/export/events/attended/json?cw=${cw}&year=${year}&userID=${userData.id}`} download={`attended_events${cw}_${year}${userData.id}.json`} className="hover:underline mx-1">JSON</a>
                <a href={`/export/events/attended/xlsx?cw=${cw}&year=${year}&userID=${userData.id}`} download={`attended_events${cw}_${year}${userData.id}.xlsx`} className="hover:underline mx-1">XLSX</a>
            </p>
        </div>
    );
}

export default attendedEvents;