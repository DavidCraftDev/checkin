import { getSessionUser } from "../src/modules/auth/cookieManager";
import { getAttendancesPerUser } from "../src/modules/eventUtilities";
import MissingStudyTimes from "./dashboardComponents/missingStudyTimes.component";
import CompletedStudyTimes from "./dashboardComponents/completedStudyTimes.component";
import AttendancesWithoutType from "./dashboardComponents/attendancesWithoutType.component";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek)

async function dashboard() {
    const user = await getSessionUser();
    const attendances = await getAttendancesPerUser(user.id, dayjs().isoWeek(), dayjs().year());
    let missingStudyTimes: Array<string> = new Array();
    user.needs.forEach((neededStudyTime) => { if (!attendances.find((attendanceData) => attendanceData.attendance.type && attendanceData.attendance.type.replace("Vertretung:", "").replace("Notiz:", "") === neededStudyTime)) missingStudyTimes.push(neededStudyTime) });
    const completedStudyTimes = attendances.filter((attendance) => attendance.attendance.type !== null)
    const attendancesWithoutType = attendances.filter((attendance) => attendance.attendance.type === null)
    return (
        <div>
            <h1>Dashboard</h1>
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

export default dashboard;