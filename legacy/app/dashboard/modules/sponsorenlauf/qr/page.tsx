import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import { redirect } from "next/navigation";
import QRScannerComponent from "./qr.component";
import { Metadata } from "next";
import { config_data } from "@/app/src/modules/data/config";

async function QRScanner() {
    if (!config_data.MODULES.SPONSORENLAUF) redirect("/dashboard");
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission === 0) redirect("/dashboard");
    return (
        <div>
            <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-2 mb-4">
                <h1>QR-Code Scanner Sponsorenlauf</h1>
                <a className="btn w-max h-min place-self-center items-center mt-2 md:mt-0" href={`/dashboard/modules/sponsorenlauf`}>Zurück</a>
            </div>
            <QRScannerComponent />
        </div>
    )
}

export default QRScanner;

export const metadata: Metadata = {
    title: "QR-Code Scanner Sponsorenlauf - CheckIN-System",
    description: "QR-Code Scanner für den Sponsorenlauf im CheckIN-System.",
} 