"use server"

import { ldap_password_reset_url, use_ldap } from "../src/modules/config"

async function getPasswordResetURL() {
    if (use_ldap) {
        return ldap_password_reset_url
    }
    return ""
}

export default getPasswordResetURL