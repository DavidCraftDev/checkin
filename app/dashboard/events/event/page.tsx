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

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

async function EventPage(props: { searchParams: Promise<SearchParams> }) {
    const searchParams = await props.searchParams;
    const user = await getSessionUser(1);
    const eventID = searchParams.id;
    if (!eventID) notFound();
    const event = await getEventPerID(eventID);
    if (!event) notFound();
    if (event.user !== user.id) redirect("/dashboard/");
    if (event.type.startsWith("Unterricht:")) redirect("/dashboard/events/lesson/" + eventID);

    const attendances = await getAttendancesPerEvent(eventID);
    const addable = event.cw === dayjs().isoWeek() && dayjs(event.created_at).year() === dayjs().year();

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Studienzeit: {event.type}</h1>
                    <p className="text-gray-600">
                        Leitung: <span className="font-semibold text-gray-800">{user.displayname}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0h18M5.25 12h13.5" />
                            </svg>
                            {dayjs(event.created_at).format("DD.MM.YYYY HH:mm")}
                        </span>
                        <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0h18" />
                            </svg>
                            KW {event.cw}
                        </span>
                        <span className="flex items-center gap-1">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                            {attendances.length} Schüler
                        </span>
                    </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                     <a href={`/export/events/event/json?eventID=${eventID}`} download={`event${eventID}.json`} className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-4 py-2 flex items-center rounded-md border border-gray-200 transition-colors">
                        JSON
                    </a>
                    <a href={`/export/events/event/xlsx?eventID=${eventID}`} download={`event${eventID}.xlsx`} className="btn bg-green-50 hover:bg-green-100 text-green-700 text-sm px-4 py-2 flex items-center rounded-md border border-green-200 transition-colors">
                        Excel
                    </a>
                </div>
            </div>

            {addable && (
                <div className="mb-10">
                    <CheckinForm event={event} />
                </div>
            )}

            <EventTable attendances={attendances} user={user} eventID={eventID} addable={addable} />
        </div>
    );
}

export default EventPage;

export const metadata: Metadata = {
    title: "Studienzeit - CheckIN-System",
    description: "Eine Studienzeit im CheckIN-System",
}
