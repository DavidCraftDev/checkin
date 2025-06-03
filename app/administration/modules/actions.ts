"use server";

import { config_data, readConfig, writeConfig } from "@/app/src/modules/data/config";
import { revalidatePath } from "next/cache";

export async function toggleSponsorenlaufModule(formData: FormData) {
    const newValue = formData.get("sponsorenlauf") === "on";
    await readConfig(false);
    config_data.MODULES.SPONSORENLAUF = newValue;
    await writeConfig();
    revalidatePath("/administration/settings/modules");
}
