export function isLDAPEnabled() {
    let result: boolean = false;
    if (process.env.ldap === "true") {
        result = true;
    }
    return result;
}

