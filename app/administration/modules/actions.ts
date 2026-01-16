"use server";

import { config_data, readConfig, writeConfig } from "@/lib/data/config";
import { revalidatePath } from "next/cache";
import { redirect } from "next/dist/client/components/navigation";

export async function toggleSponsorenlaufModule(formData: FormData) {
    const newValue = formData.get("sponsorenlauf") === "on";
    config_data.MODULES.SPONSORENLAUF = newValue;
    readConfig(false);
    writeConfig();
    readConfig(false);
    revalidatePath("/administration/modules");
    redirect("/administration/modules");
}
