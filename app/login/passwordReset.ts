"use server";

import { config_data } from "@/lib/data/config";

async function getPasswordResetURL(): Promise<string> {
    if (config_data.LDAP.ENABLE) return config_data.LDAP.PASSWORD_RESET_URL;
    return "https://example.com";
}

export default getPasswordResetURL;