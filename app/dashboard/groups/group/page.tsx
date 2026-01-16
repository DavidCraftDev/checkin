import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/cookieManager";
import { getGroupMembers } from "@/lib/groups";
import CalendarWeek from "@/components/calendarweek";
import { SearchParams } from "@/types/searchParams";
import GroupTable from "./groupTable.component";
import { getAttendedStudyTimesCount } from "@/lib/studyTime";
import { GroupMember } from "@/types/groups";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

interface AttendanceCount {
  normal: number,
  parallel: number,
  noted: number,
  needed: number,
  trafficLight: number
}

async function GroupPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const sessionUser = await getSessionUser(1);

  // Use groupId consistently
  if (searchParams.groupId && !sessionUser.groups.includes(searchParams.groupId) && sessionUser.permission < 2) redirect("/dashboard");
  const groupId = searchParams.groupId || sessionUser.groups[0];
  if (!groupId) notFound();

  const currentWeek = dayjs().isoWeek();
  const currentYear = dayjs().year();
  const cw = Number(searchParams.cw) || currentWeek;
  const year = Number(searchParams.year) || currentYear;
  if (cw > dayjs().year(year).isoWeeksInYear() || cw < 1 || year > currentYear || (year == currentYear && cw > currentWeek)) redirect("/dashboard");

  const groupData: GroupMember[] = await getGroupMembers(groupId, cw, year);
  const studyTimeData: Record<string, AttendanceCount> = {};

  // Using Promise.all with map for async operations
  await Promise.all(groupData.map(async (user) => {
    if (user.user.needs.length === 0 && user.user.permission !== 0) return;
    const { normalStudyTimes, parallelStudyTimes, notedStudyTimes, neededStudyTimes, trafficLightCount, total } = await getAttendedStudyTimesCount(user.user, cw, year);
    studyTimeData[user.user.id] = {
      normal: normalStudyTimes,
      parallel: parallelStudyTimes,
      noted: notedStudyTimes,
      needed: neededStudyTimes,
      trafficLight: total > 0 ? (trafficLightCount / total) : 0
    };
  }));

  groupData.sort((a, b) => {
    const nameA = a.user.displayName.toLowerCase();
    const nameB = b.user.displayName.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gruppe {groupId}</h1>
          <p className="text-gray-500">{groupData.length} Schüler</p>
        </div>
        <div className="flex items-center gap-2">
            <CalendarWeek />
            <Link href={`/dashboard/overview/group/${groupId}?startCW=${cw}&startYear=${year}`}>
                <Button>Übersicht</Button>
            </Link>
        </div>
      </div>

      <GroupTable user={groupData} cw={cw} year={year} studyTimeData={studyTimeData} />

      <div className="text-sm text-gray-500">
        Exportieren als:
        <a href={`/export/groups/group/json?groupId=${groupId}&cw=${cw}&year=${year}`} download={`group${cw}_${year}.json`} className="hover:underline mx-1 text-blue-600">JSON</a>
        <a href={`/export/groups/group/xlsx?groupId=${groupId}&cw=${cw}&year=${year}`} download={`group${cw}_${year}.xlsx`} className="hover:underline mx-1 text-blue-600">XLSX</a>
      </div>
    </div>
  );
}

export default GroupPage;

export const metadata = {
  title: "Gruppe - CheckIN-System",
  description: "Hier findest du alle Mitglieder einer Gruppe."
};
