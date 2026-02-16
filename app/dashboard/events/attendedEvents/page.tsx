import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { getAttendancesPerUser } from "@/app/src/modules/eventUtilities";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import CalendarWeek from "@/app/src/ui/calendarweek";
import { notFound, redirect } from "next/navigation";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import AttendedEventTable from "./attendedEventsTable.component";
import { getSavedNeededStudyTimes, saveNeededStudyTimes } from "@/app/src/modules/studytimeUtilities";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import { CreateStudyTimeNote } from "./forms";
import { Metadata } from "next";
import TrafficLight from "./trafficLight";

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

async function AttendedEventsPage(props: { searchParams: Promise<SearchParams> }) {
    const searchParams = await props.searchParams;
    const sessionUser = await getSessionUser();
    if (searchParams.userID && sessionUser.permission < 1) redirect("/dashboard");
    const userID = searchParams.userID || sessionUser.id;
    const userData = searchParams.userID ? await getUserPerID(userID) : sessionUser;
    if (!userData || !userData.id) notFound();
    if (searchParams.userID && (sessionUser.permission < 2 && sessionUser.group.filter(value => userData.group.includes(value)).length === 0)) redirect("/dashboard");

    const currentWeek = dayjs().isoWeek();
    const currentYear = dayjs().year();
    const cw = Number(searchParams.cw) || currentWeek;
    const year = Number(searchParams.year) || currentYear;
    if (cw > dayjs().year(year).isoWeeksInYear() || cw < 1 || year > currentYear) redirect("/dashboard/events/attendedEvents");
    if (year == currentYear && cw > currentWeek) redirect("/dashboard/events/attendedEvents");

    const attendances = await getAttendancesPerUser(userID, cw, year);
    const completedStudyTimesCount = attendances.filter((attendance) => attendance.event.type !== null && attendance.attendance.type !== "Unterricht").length;

    let isEditable = (cw === currentWeek && year === currentYear);

    let userNeeds: Array<string> = [];
    if (isEditable) {
        userNeeds = userData.needs || [];
    } else {
        const savedNeededStudyTimes = await getSavedNeededStudyTimes(userData, cw, year);
        userNeeds = savedNeededStudyTimes?.needs || [];
    }
    if (isEditable) saveNeededStudyTimes(userData);

    let isTeacher = false;
    if (sessionUser.id !== userData.id) {
        isEditable = true;
        isTeacher = true;
    }

    const missingStudyTimes: Array<string> = userNeeds.filter(neededStudyTime => !attendances.find(attendanceData => attendanceData.attendance.type && attendanceData.attendance.type.replace("Vertretung:", "").replace("Notiz:", "") === neededStudyTime));

    const studyTimeTypes: Record<string, string[]> = {};
    if (isEditable) for (const event of attendances) {
        if (event.event.id !== "NOTE") {
            const vertretung: Array<string> = [];
            const neededStudyTimesForAttendance: Array<string> = [];
            missingStudyTimes.forEach((missingStudyTime) => {
                if (event.eventUser.competence.includes(missingStudyTime)) neededStudyTimesForAttendance.push(missingStudyTime);
                else vertretung.push(missingStudyTime);
            });
            vertretung.forEach((vertretung) => neededStudyTimesForAttendance.push("Vertretung:" + vertretung));
            if (event.attendance.type !== "Zusätzliche Studienzeit") neededStudyTimesForAttendance.push("Zusätzliche Studienzeit");
            if (isTeacher) neededStudyTimesForAttendance.push("Löschen");
            studyTimeTypes[event.attendance.id] = neededStudyTimesForAttendance;
        } else {
            const neededStudyTimesForNotes: Array<string> = [];
            missingStudyTimes.forEach((missingStudyTime) => {
                neededStudyTimesForNotes.push("Notiz:" + missingStudyTime);
            });
            neededStudyTimesForNotes.push("Notiz:Löschen");
            studyTimeTypes[event.attendance.id] = neededStudyTimesForNotes;
        }
    }

    const length: number = attendances.length;
    let feedback: number = 0;
    attendances.forEach((attendance) => {
        if (attendance.attendance.feedback === "GREEN") feedback++;
        else if (attendance.attendance.feedback === "YELLOW") feedback += 2;
        else if (attendance.attendance.feedback === "RED") feedback += 3;
    });
    const feedbackAverage = length > 0 ? Math.round(feedback / length) : 0;
    const status = feedbackAverage === 1 ? "GREEN" : feedbackAverage === 2 ? "YELLOW" : "RED";
    return (
        <div>
            <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2">
                <div>
                    <h1>Teilgenommene Studienzeiten</h1>
                    <span>von {userData.displayname} <TrafficLight status={status} /></span>
                    {userData.needs.length ? <p>{completedStudyTimesCount} {completedStudyTimesCount == 1 ? "Studienzeit" : "Studienzeiten"}</p> : null}
                    {userData.needs.length && missingStudyTimes.length > 0 ? <p>Fehlende Studienzeiten: {missingStudyTimes.join(", ")} ({missingStudyTimes.length})</p> : null}
                    {isEditable && userData.needs.length && missingStudyTimes.length > 0 ? <CreateStudyTimeNote userID={userData.id} cw={cw} year={year} /> : null}
                </div>
                <CalendarWeek />
            </div>
            <AttendedEventTable attendances={attendances} isEditable={isEditable} studyTimeTypes={studyTimeTypes} isTeacher={isTeacher} />
            <p>Exportieren als:
                <a href={`/export/events/attended/json?cw=${cw}&year=${year}&userID=${userData.id}`} download={`attended_events${cw}_${year}${userData.id}.json`} className="hover:underline mx-1">JSON</a>
                <a href={`/export/events/attended/xlsx?cw=${cw}&year=${year}&userID=${userData.id}`} download={`attended_events${cw}_${year}${userData.id}.xlsx`} className="hover:underline mx-1">XLSX</a>
            </p>
        </div>
    );
}

export default AttendedEventsPage;

export const metadata: Metadata = {
    title: "Teilgenomme Studienzeiten - CheckIN-System",
    description: "Teilgenommene Studienzeiten im CheckIN-Systems",
}