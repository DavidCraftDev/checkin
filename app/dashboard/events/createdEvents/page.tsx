import { redirect } from "next/navigation";
import moment from "moment";
import CreatEventButton from "./createEventButton.component";
import { getSesessionUser } from "@/app/src/modules/authUtilities";
import { getCreatedEventsPerUser } from "@/app/src/modules/eventUtilities";
import CalendarWeek from "@/app/src/ui/calendarweek";
import CreateEventModal from "./createEventModal.component";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import CreatedEventTable from "./createdEventsTable.component";

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
      <CreatedEventTable events={data} />
      <p>Export Soon™</p>
  </div>
    );
}