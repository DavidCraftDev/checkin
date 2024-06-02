import { redirect } from "next/navigation";
import moment from "moment";
import { getSesessionUser } from "@/app/src/modules/authUtilities";
import { getCreatedEventsPerUser } from "@/app/src/modules/eventUtilities";
import CalendarWeek from "@/app/src/ui/calendarweek";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import CreatedEventTable from "./createdEventsTable.component";
import CreateEventForm from "./createEventForm.component";
import { isStudyTimeEnabled } from "@/app/src/modules/studytimeUtilities";

export default async function createdEvents({ searchParams }: { searchParams: SearchParams }) {
  const sessionUser = await getSesessionUser(1);
  if (sessionUser.permission < 1) redirect("/dashboard");

  const currentWeek = moment().week();
  const currentYear = moment().year();
  const cw = searchParams.cw || currentWeek;
  const year = searchParams.year || currentYear;
  if (cw > 53 || cw < 1 || year > currentYear) redirect("/dashboard/events/createEvents");
  if (year == currentYear && cw > currentWeek) redirect("/dashboard/events/createEvents");
  const data = await getCreatedEventsPerUser(sessionUser.id, cw, year);
  const studyTime: boolean = isStudyTimeEnabled();
  return (
    <div>
      <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2">
        <div>
          <h1>Erstellte Veranstalltungen</h1>
          <p>von {sessionUser.displayname}</p>
        </div>
        <CalendarWeek searchParams={searchParams} />
      </div>
      <CreateEventForm />
      <CreatedEventTable events={data} studyTime={studyTime} />
      <p>Exportieren als:
        <a href={"/export/events/created/json?cw=" + cw + "&year=" + year} download={"created_events" + cw + "_" + year + ".json"} className="hover:underline mx-1">JSON</a>
        <a href={"/export/events/created/xlsx?cw=" + cw + "&year=" + year} download={"created_events" + cw + "_" + year + ".xlsx"} className="hover:underline mx-1">XLSX</a>
      </p>
    </div>
  );
}