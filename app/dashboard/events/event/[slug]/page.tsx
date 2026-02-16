import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { getAttendancesPerEvent, getEventPerID } from "@/app/src/modules/eventUtilities";
import EventTable from "./eventTable.component";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import { Metadata } from "next/types";
import { CheckinForm } from "./forms";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
    const user = await getSessionUser(1);
    const eventID = (await params).slug;
    const event = await getEventPerID(eventID);
    if (!event) notFound();
    if (event.user !== user.id) redirect("/dashboard/");
    if (event.type.startsWith("Unterricht:")) redirect("/dashboard/events/lesson/" + eventID);
    const attendances = await getAttendancesPerEvent(eventID);
    const addable = event.cw === dayjs().isoWeek() && dayjs(event.created_at).year() === dayjs().year();
    return (
        <div>
            <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2">
                <div>
                    <h1>Studienzeit {event.type} {user.displayname}</h1>
                    <p>erstellt am {dayjs(event.created_at).format("DD.MM.YYYY HH:mm")} in Kalenderwoche {event.cw}</p>
                    <p>{attendances.length} anwesende Schüler</p>
                </div>
                {addable ? <CheckinForm event={event} /> : null}
            </div>
            {dayjs(event.created_at).diff(dayjs(), "day") !== 0 ? 
            <div className="rounded-md bg-yellow-50 p-4 mb-4 border-l-4 border-yellow-400">
                <div className="flex">
                    <div className="shrink-0">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Hinweis</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                            <p>
                                Diese Studienzeit wurde nicht heute erstellt. Bitte erstelle für jede Studienzeit-Stunde auch eine eigene Studienzeit im CheckIN, um die Anwesenheit der Schüler zu erfassen.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            : null}
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