import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/src/modules/authUtilities";
import { getCreatedEventsPerUser } from "@/app/src/modules/eventUtilities";
import CalendarWeek from "@/app/src/ui/calendarweek";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import CreatedEventTable from "./createdEventsTable.component";
import CreateEventForm from "./createEventForm.component";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";

dayjs.extend(isoWeek)
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)

async function createdEvents({ searchParams }: { searchParams: SearchParams }) {
  const sessionUser = await getSessionUser(1);
  if (sessionUser.permission < 1) redirect("/dashboard");

  const currentWeek = dayjs().isoWeek();
  const currentYear = dayjs().year();
  const cw = Number(searchParams.cw) || currentWeek;
  const year = Number(searchParams.year) || currentYear;
  if (cw > dayjs().year(year).isoWeeksInYear() || cw < 1 || year > currentYear) redirect("/dashboard/events/createEvents");
  if (year == currentYear && cw > currentWeek) redirect("/dashboard/events/createEvents");
  const data = await getCreatedEventsPerUser(sessionUser.id, cw, year);
  return (
    <div>
      <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2">
        <div>
          <h1>Erstellte Studienzeiten</h1>
          <p>von {sessionUser.displayname}</p>
        </div>
        <CalendarWeek />
      </div>
      <CreateEventForm user={sessionUser} />
      <CreatedEventTable events={data} />
      <p>Exportieren als:
        <a href={`/export/events/created/json?cw=${cw}&year=${year}`} download={`created_events${cw}_${year}.json`} className="hover:underline mx-1">JSON</a>
        <a href={`/export/events/created/xlsx?cw=${cw}&year=${year}`} download={`created_events${cw}_${year}.xlsx`} className="hover:underline mx-1">XLSX</a>
      </p>
    </div>
  );
}

export default createdEvents;