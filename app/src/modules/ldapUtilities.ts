"use server"

export function isLDAPEnabled() {
    "use server"
    let result: boolean = false;
    if (process.env.ldap === "true") {
        result = true;
    }
    return result;
}

