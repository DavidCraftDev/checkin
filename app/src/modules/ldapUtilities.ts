export function isLDAPEnabled() {
    let result: boolean = false;
    if (process.env.ldap?.startsWith("true")) {
        result = true;
    }
    return result;
}

