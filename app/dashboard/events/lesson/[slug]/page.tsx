import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { getAttendancesPerEvent, getEventPerID } from "@/app/src/modules/eventUtilities";
import EventTable from "./eventTable.component";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import { Metadata } from "next/types";

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
    const user = await getSessionUser(1);
    const eventID = (await params).slug;
    if (!eventID) notFound();
    const event = await getEventPerID(eventID);
    if (!event) notFound();
    if (event.user !== user.id) redirect("/dashboard/");
    if (!event.type.startsWith("Unterricht:")) redirect("/dashboard/events/event?id=" + eventID);
    const attendances = await getAttendancesPerEvent(eventID);
    const attendedStudents = attendances.filter(attendance => attendance.attendance.attended === true).length;
    const notAttendedStudents = attendances.filter(attendance => attendance.attendance.attended === false).length;
    const addable = event.cw === dayjs().isoWeek() && dayjs(event.created_at).year() === dayjs().year();
    return (
        <div>
            <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2">
                <div>
                    <h1>Unterricht {event.type.replace("Unterricht:", "")} {user.displayname}</h1>
                    <p>am {dayjs(event.created_at).format("DD.MM.YYYY HH:mm")} in Kalenderwoche {event.cw}</p>
                    <p>{attendedStudents} anwesende Schüler, {notAttendedStudents} abwesende Schüler</p>
                </div>
                <span>{addable ? <a className="btn float-right px-4" href={`/dashboard/events/lesson/${event.id}/qr`}>QR-Scanner</a> : null}</span>
            </div>
            <EventTable attendances={attendances} user={user} eventID={eventID} addable={addable} />
            <p className="hidden">Exportieren als:
                <a href={`/export/events/event/json?eventID=${eventID}`} download={`event${eventID}.json`} className="hover:underline mx-1">JSON</a>
                <a href={`/export/events/event/xlsx?eventID=${eventID}`} download={`event${eventID}.xlsx`} className="hover:underline mx-1">XLSX</a>
            </p>
        </div>
    );
}

export default EventPage;

export const metadata: Metadata = {
    title: "Unterricht - CheckIN-System",
    description: "Eine Unterrichtsstunde im CheckIN-System",
}