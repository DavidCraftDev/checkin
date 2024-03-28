import { SearchParams } from "@/app/src/interfaces/searchParams";
import { getSesessionUser } from "@/app/src/modules/authUtilities";
import { getEventPerID } from "@/app/src/modules/eventUtilities";
import moment from "moment";
import { redirect } from "next/navigation";
import QRScannerComponent from "./qr.component";
import QrScanner from 'qr-scanner';


export default async function qrscanner({searchParams}: {searchParams: SearchParams}) {
    const user = await getSesessionUser(1);
    const userID = user.id;
    const EventID = searchParams.id
    if(!EventID) redirect("/dashboard/");
    const event = await getEventPerID(EventID);
    if(!event.id) redirect("/dashboard/");
    if(event.user !== userID) redirect("/dashboard/");
    let addable: boolean = false;
    if((event.cw === moment().week()) && (moment(event.created_at).year() === moment().year())) addable = true;
    if(!addable) redirect("/dashboard/");
    return (
        <div>
            <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2">
                <h1>QR Code Scanner: {event.name}</h1>
                <a className="btn w-max h-min" href={"/dashboard/events/event?id=" + EventID}>Zurück zum Event</a>
            </div>
            <QRScannerComponent />
        </div>
    )
}