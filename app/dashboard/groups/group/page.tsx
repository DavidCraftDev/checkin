import { redirect } from "next/navigation";
import { getSesessionUser } from "@/app/src/modules/authUtilities";
import moment from "moment";
import { getGroupMembers } from "@/app/src/modules/groupUtilities";
import CalendarWeek from "@/app/src/ui/calendarweek";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import GroupTable from "./groupTable.component";

export default async function group({searchParams}: {searchParams: SearchParams}) {
  const sessionUser = await getSesessionUser(1);
  if(searchParams.userID && sessionUser.permission < 2) redirect("/dashboard");
  const groupID = searchParams.groupID || sessionUser.group;
  if(!groupID) redirect("/dashboard");

  const currentWeek = moment().week();
  const currentYear = moment().year();
  const cw = searchParams.cw || currentWeek;
  const year = searchParams.year || currentYear;
  if(cw > 53 || cw < 1 || year > currentYear) redirect("/dashboard/events/attendedEvents");
  if(year == currentYear && cw > currentWeek) redirect("/dashboard/events/attendedEvents");

    let groupData = await getGroupMembers(groupID, cw, year);
    const gruppenMitglieder = groupData.length;
    return (
      <div>
            <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2">
            <div>
                <h1>Gruppe {groupID}</h1>
                <p>{gruppenMitglieder} Mitglieder</p>
            </div>
            <CalendarWeek searchParams={searchParams} />
        </div>
      <GroupTable user={groupData} cw={cw} year={year} />
      <a href={"/export/groups/group/json?groupID=" + groupID + "&cw=" + cw + "&year=" + year} download={"group" + cw + "_" + year + ".json"} className="hover:underline">Exportieren</a>
  </div>
    );
}