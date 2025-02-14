import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { getEventPerID } from "@/app/src/modules/eventUtilities";
import { redirect } from "next/navigation";
import QRScannerComponent from "./qr.component";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import { Metadata } from "next";

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

async function QRScanner({ params }: { params: Promise<{ slug: string }> }) {
    const user = await getSessionUser(1);
    const eventID = (await params).slug;
    const event = await getEventPerID(eventID);
    if (!event || !event.id || event.user !== user.id) redirect("/dashboard/");
    if (event.cw !== dayjs().isoWeek() || dayjs(event.created_at).year() !== dayjs().year()) redirect("/dashboard/");
    return (
        <div>
            <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2 mb-4">
                <h1>QR Code Scanner: {event.type.replace("Unterricht:", "")} {user.displayname}</h1>
                <a className="btn w-max h-min place-self-center items-center mt-2 md:mt-0" href={`/dashboard/events/lesson/${eventID}`}>Zurück zur Unterrichtsstunde</a>
            </div>
            <QRScannerComponent eventID={eventID} />
        </div>
    )
}

export default QRScanner;

export const metadata: Metadata = {
    title: "QR Code Scanner - CheckIN-System",
    description: "QR Code Scanner für das CheckIN-System",
} 