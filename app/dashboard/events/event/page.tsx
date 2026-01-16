import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { getAttendancesPerEvent, getEventPerID } from "@/app/src/modules/eventUtilities";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import EventTable from "./eventTable.component";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import { Metadata } from "next/types";
import { CheckinForm } from "./forms";
import { DATE_FORMATS, Permission, SPECIAL_EVENT_TYPES } from "@/app/src/constants/permissions";

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

async function EventPage(props: { searchParams: Promise<SearchParams> }) {
    const searchParams = await props.searchParams;
    const user = await getSessionUser(Permission.TEACHER);
    const eventID = searchParams.id;
    if (!eventID) notFound();
    const event = await getEventPerID(eventID);
    if (!event) notFound();
    if (event.user !== user.id) redirect("/dashboard/");
    if (event.type.startsWith(SPECIAL_EVENT_TYPES.LESSON_PREFIX)) redirect(`/dashboard/events/lesson/${eventID}`);
    const attendances = await getAttendancesPerEvent(eventID);
    const addable = event.cw === dayjs().isoWeek() && dayjs(event.created_at).year() === dayjs().year();
    return (
        <div>
            <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2">
                <div>
                    <h1>Studienzeit {event.type} {user.displayname}</h1>
                    <p>erstellt am {dayjs(event.created_at).format(DATE_FORMATS.DATE_TIME_FULL)} in Kalenderwoche {event.cw}</p>
                    <p>{attendances.length} anwesende Schüler</p>
                </div>
                {addable ? <CheckinForm event={event} /> : null}
            </div>
            <EventTable attendances={attendances} user={user} eventID={eventID} addable={addable} />
            <p>Exportieren als:
                <a href={`/export/events/event/json?eventID=${eventID}`} download={`event${eventID}.json`} className="hover:underline mx-1">JSON</a>
                <a href={`/export/events/event/xlsx?eventID=${eventID}`} download={`event${eventID}.xlsx`} className="hover:underline mx-1">XLSX</a>
            </p>
        </div>
    );
}

export default EventPage;

export const metadata: Metadata = {
    title: "Studienzeit - CheckIN-System",
    description: "Eine Studienzeit im CheckIN-System",
}