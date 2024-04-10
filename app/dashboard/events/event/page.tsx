import { redirect } from "next/navigation";
import { getSesessionUser } from "@/app/src/modules/authUtilities";
import { getAttendancesPerEvent, getEventPerID } from "@/app/src/modules/eventUtilities";
import moment from "moment";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import EventTable from "./eventTable.component";
import CheckinForm from "./checkinForm.component";

export default async function event({ searchParams }: { searchParams: SearchParams }) {
    const user = await getSesessionUser(1);
    const userID = user.id;
    const EventID = searchParams.id
    if (!EventID) redirect("/dashboard/");
    const event = await getEventPerID(EventID);
    if (!event.id) redirect("/dashboard/");
    if (event.user !== userID) redirect("/dashboard/");
    const attendances = await getAttendancesPerEvent(EventID);
    const attendanceCount = attendances.length;
    let addable: boolean = false;
    if ((event.cw === moment().week()) && (moment(event.created_at).year() === moment().year())) addable = true;
    return (
        <div>
            <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2">
                <div>
                    <h1>Veranstalltung: {event.name}</h1>
                    <p>erstellt am {moment(Date.parse(event.created_at)).format("DD.MM.YYYY HH:mm")} in Kalenderwoche {event.cw}</p>
                    <p>{attendanceCount} Teilnehmer</p>
                </div>
                {addable ? <CheckinForm eventID={EventID} /> : null}
            </div>
            <EventTable attendances={attendances} addable={addable} />
            <p>Exportieren als:
                <a href={"/export/events/event/json?eventID=" + EventID} download={"event" + EventID + ".json"} className="hover:underline mx-1">JSON</a>
                <a href={"/export/events/event/xlsx?eventID=" + EventID} download={"event" + EventID + ".xlsx"} className="hover:underline mx-1">XLSX</a>
            </p>
        </div>
    );
}