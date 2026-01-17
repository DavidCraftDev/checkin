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
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

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
    if (isEditable) {
        for (const event of attendances) {
             if (event.event.id !== "NOTE") {
                const vertretung: Array<string> = [];
                const neededStudyTimesForAttendance: Array<string> = [];
                missingStudyTimes.forEach((missingStudyTime) => {
                    if (event.eventUser.competence.includes(missingStudyTime)) neededStudyTimesForAttendance.push(missingStudyTime);
                    else vertretung.push(missingStudyTime);
                });
                vertretung.forEach((vertretung) => neededStudyTimesForAttendance.push("Vertretung:" + vertretung));
                neededStudyTimesForAttendance.push("Keine Studienzeit");
                if(isTeacher) neededStudyTimesForAttendance.push("Löschen");
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
    }

    const length: number = attendances.length;
    let feedback: number = 0;
    attendances.forEach((attendance) => {
        if(attendance.attendance.feedback === "GREEN") feedback++;
        else if(attendance.attendance.feedback === "YELLOW") feedback += 2;
        else if(attendance.attendance.feedback === "RED") feedback += 3;
    });
    const feedbackAverage = length > 0 ? Math.round(feedback / length) : 0;
    const status = feedbackAverage === 1 ? "GREEN" : feedbackAverage === 2 ? "YELLOW" : "RED";

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-800">Teilgenommene Studienzeiten</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="text-lg text-gray-600">von <span className="font-semibold text-gray-900">{userData.displayname}</span></span>
                        <TrafficLight status={status} />
                    </div>

                    <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded-md border border-gray-200">
                         {userData.needs.length ? (
                            <div className="flex items-center gap-2 text-gray-700">
                                <span className="font-medium">Erledigt:</span>
                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-sm font-semibold">{completedStudyTimesCount} {completedStudyTimesCount == 1 ? "Studienzeit" : "Studienzeiten"}</span>
                            </div>
                        ) : null}

                        {userData.needs.length && missingStudyTimes.length > 0 ? (
                            <div className="flex items-start gap-2 text-red-600 mt-1">
                                <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold">Fehlend ({missingStudyTimes.length}): </span>
                                    <span>{missingStudyTimes.join(", ")}</span>
                                </div>
                            </div>
                        ) : null}

                        {isEditable && userData.needs.length && missingStudyTimes.length > 0 ? (
                            <div className="mt-2">
                                <CreateStudyTimeNote userID={userData.id} cw={cw} year={year} />
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className="w-full lg:w-auto">
                    <CalendarWeek />
                </div>
            </div>

            <AttendedEventTable attendances={attendances} isEditable={isEditable} studyTimeTypes={studyTimeTypes} isTeacher={isTeacher} />

            <div className="flex gap-3 flex-wrap mt-8 justify-end">
                <span className="text-sm text-gray-500 self-center mr-2">Exportieren als:</span>
                <a href={`/export/events/attended/json?cw=${cw}&year=${year}&userID=${userData.id}`} download={`attended_events${cw}_${year}${userData.id}.json`} className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-4 py-2 flex items-center rounded-md border border-gray-200 transition-colors">
                    JSON
                </a>
                <a href={`/export/events/attended/xlsx?cw=${cw}&year=${year}&userID=${userData.id}`} download={`attended_events${cw}_${year}${userData.id}.xlsx`} className="btn bg-green-50 hover:bg-green-100 text-green-700 text-sm px-4 py-2 flex items-center rounded-md border border-green-200 transition-colors">
                    Excel
                </a>
            </div>
        </div>
    );
}

export default AttendedEventsPage;

export const metadata: Metadata = {
    title: "Teilgenomme Studienzeiten - CheckIN-System",
    description: "Teilgenommene Studienzeiten im CheckIN-Systems",
}
