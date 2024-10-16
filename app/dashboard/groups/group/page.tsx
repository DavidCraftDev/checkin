import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { getGroupMembers } from "@/app/src/modules/groupUtilities";
import CalendarWeek from "@/app/src/ui/calendarweek";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import GroupTable from "./groupTable.component";
import { getAttendedStudyTimesCount } from "@/app/src/modules/studytimeUtilities";
import { GroupMember } from "@/app/src/interfaces/groups";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";

dayjs.extend(isoWeek)
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)

interface attendaceCount {
  normal: number,
  parallel: number,
  noted: number
  needed: number
}

async function group({ searchParams }: { searchParams: SearchParams }) {
  const sessionUser = await getSessionUser(1);
  if (searchParams.groupID && !sessionUser.group.includes(searchParams.groupID) && sessionUser.permission < 2) redirect("/dashboard");
  const groupID = searchParams.groupID || sessionUser.group[0];
  if (!groupID) notFound();

  const currentWeek = dayjs().isoWeek();
  const currentYear = dayjs().year();
  const cw = Number(searchParams.cw) || currentWeek;
  const year = Number(searchParams.year) || currentYear;
  if (cw > dayjs().year(year).isoWeeksInYear() || cw < 1 || year > currentYear || (year == currentYear && cw > currentWeek)) redirect("/dashboard");

  let groupData: GroupMember[] = await getGroupMembers(groupID, cw, year);
  const studyTimeData: Record<string, attendaceCount> = {};
  for (const user of groupData) {
    const { normalStudyTimes, parallelStudyTimes, notedStudyTimes, neededStudyTimes } = await getAttendedStudyTimesCount(user.user, cw, year);
    studyTimeData[user.user.id] = { normal: normalStudyTimes, parallel: parallelStudyTimes, noted: notedStudyTimes, needed: neededStudyTimes };
  }
  return (
    <div>
      <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2">
        <div>
          <h1>Gruppe {groupID}</h1>
          <p>{groupData.length} Mitglieder</p>
        </div>
        <CalendarWeek />
      </div>
      <GroupTable user={groupData} cw={cw} year={year} studyTimeData={studyTimeData} />
      <p>Exportieren als:
        <a href={`/export/groups/group/json?groupID=${groupID}&cw=${cw}&year=${year}`} download={`group${cw}_${year}.json`} className="hover:underline mx-1">JSON</a>
        <a href={`/export/groups/group/xlsx?groupID=${groupID}&cw=${cw}&year=${year}`} download={`group${cw}_${year}.xlsx`} className="hover:underline mx-1">XLSX</a>
      </p>
    </div>
  );
}

export default group;