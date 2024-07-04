import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/app/src/modules/authUtilities";
import moment from "moment";
import { getGroupMembers } from "@/app/src/modules/groupUtilities";
import CalendarWeek from "@/app/src/ui/calendarweek";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import GroupTable from "./groupTable.component";
import { getAttendedStudyTimesCount } from "@/app/src/modules/studytimeUtilities";
import { studytime } from "@/app/src/modules/config";

export default async function group({ searchParams }: { searchParams: SearchParams }) {
  const sessionUser = await getSessionUser(1);
  if (searchParams.userID && sessionUser.permission < 2) redirect("/dashboard");
  const groupID = searchParams.groupID || sessionUser.group;
  if (!groupID) notFound();

  const currentWeek = moment().week();
  const currentYear = moment().year();
  const cw = searchParams.cw || currentWeek;
  const year = searchParams.year || currentYear;
  if (cw > 53 || cw < 1 || year > currentYear) redirect("/dashboard/events/attendedEvents");
  if (year == currentYear && cw > currentWeek) redirect("/dashboard/events/attendedEvents");

  let groupData = await getGroupMembers(groupID, cw, year);
  const gruppenMitglieder = groupData.length;
  const data: any = {};
  for (const user of groupData) {
    data[user.user.id] = await getAttendedStudyTimesCount(user.user.id, cw, year);
  }
  return (
    <div>
      <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2">
        <div>
          <h1>Gruppe {groupID}</h1>
          <p>{gruppenMitglieder} Mitglieder</p>
        </div>
        <CalendarWeek searchParams={searchParams} />
      </div>
      <GroupTable user={groupData} cw={cw} year={year} studyTime={studytime} studyTimeData={data} />
      <p>Exportieren als:
        <a href={"/export/groups/group/json?groupID=" + groupID + "&cw=" + cw + "&year=" + year} download={"group" + cw + "_" + year + ".json"} className="hover:underline mx-1">JSON</a>
        <a href={"/export/groups/group/xlsx?groupID=" + groupID + "&cw=" + cw + "&year=" + year} download={"group" + cw + "_" + year + ".xlsx"} className="hover:underline mx-1">XLSX</a>
      </p>
    </div>
  );
}