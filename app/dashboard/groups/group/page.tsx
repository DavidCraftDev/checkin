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

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

interface AttendanceCount {
  normal: number,
  parallel: number,
  noted: number,
  needed: number
}

async function GroupPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const sessionUser = await getSessionUser(1);
  if (searchParams.groupID && !sessionUser.group.includes(searchParams.groupID) && sessionUser.permission < 2) redirect("/dashboard");
  const groupID = searchParams.groupID || sessionUser.group[0];
  if (!groupID) notFound();

  const currentWeek = dayjs().isoWeek();
  const currentYear = dayjs().year();
  const cw = Number(searchParams.cw) || currentWeek;
  const year = Number(searchParams.year) || currentYear;
  if (cw > dayjs().year(year).isoWeeksInYear() || cw < 1 || year > currentYear || (year == currentYear && cw > currentWeek)) redirect("/dashboard");

  const groupData: GroupMember[] = await getGroupMembers(groupID, cw, year);
  const studyTimeData: Record<string, AttendanceCount> = {};
  await Promise.all(groupData.map(async (user) => {
    if(user.user.needs.length === 0 && user.user.permission !== 0) return;
    const { normalStudyTimes, parallelStudyTimes, notedStudyTimes, neededStudyTimes } = await getAttendedStudyTimesCount(user.user, cw, year);
    studyTimeData[user.user.id] = { normal: normalStudyTimes, parallel: parallelStudyTimes, noted: notedStudyTimes, needed: neededStudyTimes };
  }));

  groupData.sort((a, b) => {
    const nameA = a.user.displayname.toLowerCase();
    const nameB = b.user.displayname.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div>
          <h1>Gruppe {groupID}</h1>
          <p>{groupData.length} Schüler</p>
        </div>
        <CalendarWeek />
        <a href={`/dashboard/overview/group/${groupID}?startCW=${cw}&startYear=${year}`} className="btn w-min">Übersicht</a>
      </div>
      <GroupTable user={groupData} cw={cw} year={year} studyTimeData={studyTimeData} />
      <p>Exportieren als:
        <a href={`/export/groups/group/json?groupID=${groupID}&cw=${cw}&year=${year}`} download={`group${cw}_${year}.json`} className="hover:underline mx-1">JSON</a>
        <a href={`/export/groups/group/xlsx?groupID=${groupID}&cw=${cw}&year=${year}`} download={`group${cw}_${year}.xlsx`} className="hover:underline mx-1">XLSX</a>
      </p>
    </div>
  );
}

export default GroupPage;

export const metadata = {
  title: "Gruppe - CheckIN-System",
  description: "Hier findest du alle Mitglieder einer Gruppe."
};