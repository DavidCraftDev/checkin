import { redirect } from "next/navigation";
import { getSesessionUser } from "@/app/src/modules/authUtilities";
import moment from "moment";
import { getGroupMembers } from "@/app/src/modules/groupUtilities";
import CalendarWeek from "@/app/src/ui/calendarweek";
import { SearchParams } from "@/app/src/interfaces/searchParams";

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
      <h1>Gruppe {groupID}</h1>
      <p>{gruppenMitglieder} Mitglieder</p>
      <CalendarWeek searchParams={searchParams} />
      <div className="w-full mt-4 p-2 pb-0 border-gray-200 border-2 rounded-md">
      <table className="table-auto w-full text-left">
          <thead>
              <tr className="border-b border-gray-600">
                  <th className="py-4 px-2">Name</th>
                  <th className="py-4 px-2">Teilgenommene Events</th>
                  <th className="py-4 px-2">Anzeigen</th>
              </tr>
          </thead>
          <tbody>
          {groupData.map((user: any) => (
              <tr key={user.user.id} className="border-b border-gray-200">
                  <td className="p-2">{user.user.displayname}</td>
                  <td className="p-2">{user.attendances}</td>
                  <td className="p-2"><a href={`/dashboard/events/attendedEvents?userID=${user.user.id}&cw=${cw}&year=${year}`} className="hover:underline">Anzeigen</a></td>
              </tr>
          ))}
          </tbody>
      </table>
      </div>
      <p>Export Soon™</p>
  </div>
    );
}