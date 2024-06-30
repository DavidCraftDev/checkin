export function isLDAPEnabled() {
    let result: boolean = false;
    if (process.env.ldap?.startsWith("true")) {
        result = true;
    }
    return result;
}

export function checkIfAllLDAPVariablesAreSet() {
    if (!process.env.LDAP_URL) throw new Error("LDAP_URL is required");
    if (!process.env.LDAP_URL.startsWith("ldap://") && !process.env.LDAP_URL.startsWith("ldaps://")) throw new Error("LDAP_URL must start with ldap:// or ldaps://");
    if (!process.env.LDAP_BIND_DN) throw new Error("LDAP_BIND_DN is required");
    if (!process.env.LDAP_BIND_PASSWORD) throw new Error("LDAP_BIND_CREDENTIALS is required");
    if (!process.env.LDAP_SEARCH_BASE) throw new Error("LDAP_SEARCH_BASE is required");
    if (!process.env.LDAP_SEARCH_FILTER) throw new Error("LDAP_SEARCH_FILTER is required");
}