import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/app/src/modules/authUtilities";
import moment from "moment";
import { getGroupMembers } from "@/app/src/modules/groupUtilities";
import CalendarWeek from "@/app/src/ui/calendarweek";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import GroupTable from "./groupTable.component";
import { getAttendedStudyTimesCount } from "@/app/src/modules/studytimeUtilities";
import { studytime } from "@/app/src/modules/config";
import { GroupMember } from "@/app/src/interfaces/groups";

interface attendaceCount {
  normal: number,
  parallel: number,
  noted: number
  needed: number
}

async function group({ searchParams }: { searchParams: SearchParams }) {
  const sessionUser = await getSessionUser(1);
  if (searchParams.groupID && sessionUser.permission < 2) redirect("/dashboard");
  const groupID = searchParams.groupID || sessionUser.group;
  if (!groupID) notFound();

  const currentWeek = moment().week();
  const currentYear = moment().year();
  const cw = searchParams.cw || currentWeek;
  const year = searchParams.year || currentYear;
  if (cw > 53 || cw < 1 || year > currentYear || (year == currentYear && cw > currentWeek)) {
    redirect("/dashboard")
  }

  let groupData: GroupMember[] = await getGroupMembers(groupID, cw, year);
  const studyTimeData: Record<string, attendaceCount> = {};
  for (const user of groupData) {
    const { normalStudyTimes, parallelStudyTimes, notedStudyTimes, neededStudyTimes } = await getAttendedStudyTimesCount(user.user.id, cw, year);
    studyTimeData[user.user.id] = { normal: normalStudyTimes, parallel: parallelStudyTimes, noted: notedStudyTimes, needed: neededStudyTimes };
  }
  return (
    <div>
      <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2">
        <div>
          <h1>Gruppe {groupID}</h1>
          <p>{groupData.length} Mitglieder</p>
        </div>
        <CalendarWeek searchParams={searchParams} />
      </div>
      <GroupTable user={groupData} cw={cw} year={year} studyTime={studytime} studyTimeData={studyTimeData} />
      <p>Exportieren als:
        <a href={`/export/groups/group/json?groupID=${groupID}&cw=${cw}&year=${year}`} download={`group${cw}_${year}.json`} className="hover:underline mx-1">JSON</a>
        <a href={`/export/groups/group/xlsx?groupID=${groupID}&cw=${cw}&year=${year}`} download={`group${cw}_${year}.xlsx`} className="hover:underline mx-1">XLSX</a>
      </p>
    </div>
  );
}

export default group;