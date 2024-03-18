import { redirect } from "next/navigation";
import moment from "moment";
import CreatEventButton from "./createEventButton.component";
import { getSesessionUser } from "@/app/src/modules/authUtilities";
import { getCreatedEventsPerUser } from "@/app/src/modules/eventUtilities";
import CalendarWeek from "@/app/src/ui/calendarweek";
import CreateEventModal from "./createEventModal.component";
import { SearchParams } from "@/app/src/interfaces/searchParams";

export default async function createdEvents({searchParams}: {searchParams: SearchParams}) {
  const sessionUser = await getSesessionUser(1);
  if(sessionUser.permission < 1) redirect("/dashboard");

  const currentWeek = moment().week();
  const currentYear = moment().year();
  const cw = searchParams.cw || currentWeek;
  const year = searchParams.year || currentYear;
  if(cw > 53 || cw < 1 || year > currentYear) redirect("/dashboard/events/attendedEvents");
  if(year == currentYear && cw > currentWeek) redirect("/dashboard/events/attendedEvents");

  const data = await getCreatedEventsPerUser(sessionUser.id, cw, year);
    return (
      <div>
      <h1>Erstellte Veranstalltungen</h1>
      <div>von { sessionUser.displayname }</div>
      <CreatEventButton />
      <CalendarWeek searchParams={searchParams} />
      <div className="w-full mt-4 p-2 pb-0 border-gray-200 border-2 rounded-md">
      <table className="table-auto w-full text-left">
          <thead>
              <tr className="border-b border-gray-600">
                  <th className="py-4 px-2">Name</th>
                  <th className="py-4 px-2">Teilnehmer</th>
                  <th className="py-4 px-2">Zeit</th>
                  <th className="py-4 px-2">Anzeigen</th>
              </tr>
          </thead>
          <tbody>
          {data.map((event: any) => (
              <tr key={event.event.id} className="border-b border-gray-200">
                  <td className="p-2">{event.event.name}</td>
                  <td className="p-2">{event.user}</td>
                  <td className="p-2">{moment(Date.parse(event.event.created_at)).format("DD.MM.YYYY HH:mm")}</td>
                  <td className="p-2"><a href={`/dashboard/events/event?id=${event.event.id}`} className="hover:underline">Anzeigen</a></td>
              </tr>
          ))}
          </tbody>
      </table>
      </div>
      <p>Export Soon™</p>
      <CreateEventModal/>
  </div>
    );
}