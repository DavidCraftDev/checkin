import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/cookieManager";
import SponsorenlaufModuleCheck from "./forms";
import { config_data } from "@/lib/data/config";

export default async function ModuleSettingsPage() {
    const { session } = await getCurrentSession();
    if (!session) redirect("/login");

    return (
        <div>
            <h1>Moduleinstellungen</h1>
            <div className="formLayout">
                <SponsorenlaufModuleCheck defaultChecked={config_data.MODULES.SPONSORENLAUF} />
            </div>
        </div>
    );
}
