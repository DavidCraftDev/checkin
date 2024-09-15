import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/app/src/modules/authUtilities";
import { getAttendancesPerEvent, getEventPerID } from "@/app/src/modules/eventUtilities";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import EventTable from "./eventTable.component";
import CheckinForm from "./checkinForm.component";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";

dayjs.extend(isoWeek)
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)

export default async function event({ searchParams }: { searchParams: SearchParams }) {
    const user = await getSessionUser(1);
    const eventID = searchParams.id
    if (!eventID) notFound();
    const event = await getEventPerID(eventID);
    if (!event) notFound();
    if (event.user !== user.id) redirect("/dashboard/");
    const attendances = await getAttendancesPerEvent(eventID);
    const addable = event.cw === dayjs().isoWeek() && dayjs(event.created_at).year() === dayjs().year();
    return (
        <div>
            <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2">
                <div>
                    <h1>Studienzeit {event.type} {user.displayname}</h1>
                    <p>erstellt am {dayjs(event.created_at).format("DD.MM.YYYY HH:mm")} in Kalenderwoche {event.cw}</p>
                    <p>{attendances.length} Teilnehmer</p>
                </div>
                {addable ? <CheckinForm event={event} /> : null}
            </div>
            <EventTable attendances={attendances} eventID={eventID} addable={addable} />
            <p>Exportieren als:
                <a href={`/export/events/event/json?eventID=${eventID}`} download={`event${eventID}.json`} className="hover:underline mx-1">JSON</a>
                <a href={`/export/events/event/xlsx?eventID=${eventID}`} download={`event${eventID}.xlsx`} className="hover:underline mx-1">XLSX</a>
            </p>
        </div>
    );
}