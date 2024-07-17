import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/app/src/modules/authUtilities";
import { getAttendancesPerEvent, getEventPerID } from "@/app/src/modules/eventUtilities";
import moment from "moment";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import EventTable from "./eventTable.component";
import CheckinForm from "./checkinForm.component";

export default async function event({ searchParams }: { searchParams: SearchParams }) {
    const user = await getSessionUser(1);
    const userID = user.id;
    const eventID = searchParams.id
    if (!eventID) notFound();
    const event = await getEventPerID(eventID);
    if (!event.id) notFound();
    if (event.user !== userID) redirect("/dashboard/");
    const attendances = await getAttendancesPerEvent(eventID);
    const addable = event.cw === moment().week() && moment(event.created_at).year() === moment().year();
    return (
        <div>
            <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2">
                <div>
                    <h1>{event.studyTime ? null : "Veranstaltung: "}{event.name}</h1>
                    <p>erstellt am {moment(Date.parse(event.created_at)).format("DD.MM.YYYY HH:mm")} in Kalenderwoche {event.cw}</p>
                    <p>{attendances.length} Teilnehmer</p>
                </div>
                {addable ? <CheckinForm eventID={eventID} /> : null}
            </div>
            <EventTable attendances={attendances} addable={addable} studyTime={event.studyTime} />
            <p>Exportieren als:
                <a href={`/export/events/event/json?eventID=${eventID}`} download={`event${eventID}.json`} className="hover:underline mx-1">JSON</a>
                <a href={`/export/events/event/xlsx?eventID=${eventID}`} download={`event${eventID}.xlsx`} className="hover:underline mx-1">XLSX</a>
            </p>
        </div>
    );
}