import { config_data } from "@/lib/data/config";
import { redirect } from "next/navigation";
import { getRoundSaveDataForTable } from "./handler";
import { getCurrentSession } from "@/lib/auth/cookieManager";
import { ResetButton, SponsorenlaufTable } from "./components";

async function SponsorenlaufPage() {
    if (!config_data.MODULES.SPONSORENLAUF) redirect("/dashboard");
    const { user } = await getCurrentSession();
    if (!user) redirect("/login");
    if (user.permission === 0) redirect("/dashboard");
    const tableData = await getRoundSaveDataForTable();
    return (
        <div>
            <div className="grid grid-rows-1 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                <h1>Sponsorenlauf</h1>
                {user.permission === 2 ? (
                    <div className="hidden md:block xl:col-span-2 2xl:col-span-3"></div>
                ) : (
                    <div className="hidden md:block lg:col-span-2 xl:col-span-3 2xl:col-span-4"></div>
                )}
                <a href="/dashboard/modules/sponsorenlauf/qr" className="btn w-max h-min place-self-center items-center mt-2 md:mt-0">QR-Codes scannen</a>
                {user.permission === 2 ? <ResetButton /> : null}
            </div>
            <SponsorenlaufTable data={tableData} />
            <p>Export:
                <a href="/dashboard/modules/sponsorenlauf/export/json" className="hover:underline mx-1">JSON</a>
                <a href="/dashboard/modules/sponsorenlauf/export/xlsx" className="hover:underline mx-1">XLSX</a>
            </p>
        </div>
    );
}

export default SponsorenlaufPage;

export const metadata = {
    title: "Übersicht Sponsorenlauf - CheckIN-System",
    description: "Die Übersicht des Sponsorenlaufs",
};