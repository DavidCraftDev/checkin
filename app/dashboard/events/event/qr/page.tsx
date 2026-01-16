import { SearchParams } from "@/types/searchParams";
import { getSessionUser } from "@/lib/auth/cookieManager";
import { getEventPerID } from "@/lib/events";
import { redirect } from "next/navigation";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import { Metadata } from "next";
import QRScanner from "./qr.component";

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);


async function QRScannerPage(props: { searchParams: Promise<SearchParams> }) {
    const searchParams = await props.searchParams;
    const user = await getSessionUser(1);
    if (!searchParams.id) redirect("/dashboard/");
    const event = await getEventPerID(searchParams.id);
    if (!event || !event.id || event.user !== user.id) redirect("/dashboard/");
    if (event.cw !== dayjs().isoWeek() || dayjs(event.createdAt).year() !== dayjs().year()) redirect("/dashboard/");
    return (
        <div>
            <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2 mb-4">
                <h1>QR Code Scanner: {event.type} {user.displayName}</h1>
                <a className="btn w-max h-min place-self-center items-center mt-2 md:mt-0" href={`/dashboard/events/event?id=${searchParams.id}`}>Zurück zur Studienzeit</a>
            </div>
            <QRScanner eventID={event.id} />
        </div>
    )
}

export default QRScannerPage;

export const metadata: Metadata = {
    title: "QR Code Scanner - CheckIN-System",
    description: "QR Code Scanner für das CheckIN-System",
} 