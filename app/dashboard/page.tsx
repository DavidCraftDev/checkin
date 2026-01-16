import { getSessionUser } from "@/lib/auth/cookieManager";
import { getAttendancesPerUser } from "@/lib/events";
import MissingStudyTimes from "./dashboardComponents/missingStudyTimes.component";
import CompletedStudyTimes from "./dashboardComponents/completedStudyTimes.component";
import AttendancesWithoutType from "./dashboardComponents/attendancesWithoutType.component";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { Metadata } from "next";
import { config_data } from "@/lib/data/config";
import { getRoundCountForUser } from "./modules/sponsorenlauf/handler";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

dayjs.extend(isoWeek);

async function DashboardPage() {
    const user = await getSessionUser();
    const currentIsoWeek = dayjs().isoWeek();
    const currentYear = dayjs().year();
    const attendances = await getAttendancesPerUser(user.id, currentIsoWeek, currentYear);

    let missingStudyTimes: string[] = [];
    if (!user.needs) user.needs = [];

    user.needs.forEach((neededStudyTime) => {
        const foundAttendance = attendances.find((attendanceData) => {
            const type = attendanceData.attendance.type;
            return type && type.replace("Vertretung:", "").replace("Notiz:", "") === neededStudyTime;
        });
        if (!foundAttendance) missingStudyTimes.push(neededStudyTime);
    });

    const completedStudyTimes = attendances.filter((attendance) => attendance.attendance.type !== null && attendance.attendance.type !== "Unterricht");
    const attendancesWithoutType = attendances.filter((attendance) => attendance.attendance.type === null);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Übersicht</h1>
                <p className="text-lg text-gray-500">Hallo {user.displayName}</p>
                <div className="flex items-center gap-4">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {String(completedStudyTimes.length)} / {String(user.needs.length)} Studienzeiten besucht
                    </span>
                    {config_data.MODULES.SPONSORENLAUF && (
                         <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {await getRoundCountForUser(user.id)} Runden gelaufen!
                         </span>
                    )}
                </div>
            </div>

            {config_data.MODULES.SPONSORENLAUF && user.permission !== 0 && (
                <div className="mt-4">
                    <Link href="/dashboard/modules/sponsorenlauf">
                        <Button>Zum Sponsorenlauf</Button>
                    </Link>
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-6">
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
