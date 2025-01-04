import { getSessionUser } from "../src/modules/auth/cookieManager";
import { getAttendancesPerUser } from "../src/modules/eventUtilities";
import MissingStudyTimes from "./dashboardComponents/missingStudyTimes.component";
import CompletedStudyTimes from "./dashboardComponents/completedStudyTimes.component";
import AttendancesWithoutType from "./dashboardComponents/attendancesWithoutType.component";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { Metadata } from "next";

dayjs.extend(isoWeek);

async function DashboardPage() {
    const user = await getSessionUser();
    const currentIsoWeek = dayjs().isoWeek();
    const currentYear = dayjs().year();
    const attendances = await getAttendancesPerUser(user.id, currentIsoWeek, currentYear);
    let missingStudyTimes: Array<string> = new Array();
    user.needs.forEach((neededStudyTime) => {
        const foundAttendance = attendances.find((attendanceData) => {
            const type = attendanceData.attendance.type;
            return type && type.replace("Vertretung:", "").replace("Notiz:", "") === neededStudyTime;
        });
        if (!foundAttendance) missingStudyTimes.push(neededStudyTime);
    });
    const completedStudyTimes = attendances.filter((attendance) => attendance.attendance.type !== null);
    const attendancesWithoutType = attendances.filter((attendance) => attendance.attendance.type === null);
    return (
        <div>
            <h1>Übersicht</h1>
            <p>Hallo {user.displayname}</p>
            <p>{String(completedStudyTimes.length) + "/" + String(user.needs.length)} Studienzeiten besucht</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-4">
                <MissingStudyTimes missingStudyTimes={missingStudyTimes} />
                <CompletedStudyTimes attendances={completedStudyTimes} />
                <AttendancesWithoutType attendances={attendancesWithoutType} />
            </div>
        </div>
    );
}

export default DashboardPage;

export const metadata: Metadata = {
    title: "Übersicht - CheckIN-System",
    description: "Die Übersicht des CheckIN-Systems",
}