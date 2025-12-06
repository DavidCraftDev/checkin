"use server";

import { config_data } from "../src/modules/data/config";

async function getPasswordResetURL(): Promise<string> {
    if (config_data.LDAP.ENABLE && config_data.LDAP.PASSWORD_RESET_URL) {
        return config_data.LDAP.PASSWORD_RESET_URL;
    }
    // Return empty string instead of example.com to avoid misleading users
    return "";
}

export default getPasswordResetURL;