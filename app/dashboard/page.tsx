import { getServerSession } from "next-auth";
import { authOptions } from "@/app/src/modules/auth";
import { redirect } from "next/navigation";
import QRScanner from "./events/event/qr.component";
import { getSesession } from "../src/modules/authUtilities";

export default async function Dashboard() {
    const session = await getSesession();
    return (
        <div>
            <h1>Dashboard</h1>
            <p>Hallo { session.user.name }</p>
        </div>
    );
}