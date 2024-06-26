import { Client } from 'ldapts';
import { isLDAPEnabled } from './ldapUtilities';

let client: Client

if (isLDAPEnabled()) {
    if (!process.env.LDAP_URI) throw new Error("LDAP_URI is required");
    if (!process.env.LDAP_BIND_DN) throw new Error("LDAP_BIND_DN is required");
    if (!process.env.LDAP_BIND_CREDENTIALS) throw new Error("LDAP_BIND_CREDENTIALS is required");
    //if (!process.env.LDAP_URI.startsWith('ldap://')) throw new Error("LDAP_URI must start with ldap:// or ldaps://");
    console.log("Connect to LDAP Server " + process.env.LDAP_URI + "...")
    const tlsOptions = { rejectUnauthorized: false };
    try {
        client = new Client({
            url: process.env.LDAP_URI,
            tlsOptions: tlsOptions
        });
    } catch (error) {
        throw new Error("Failed to create LDAP client: " + error);
    }
    console.log("LDAP client created successfully!")

    console.log("Bind to LDAP Server...")
    try {
        client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_CREDENTIALS);
        console.log("LDAP bind successful")
    } catch (error) {
        throw new Error("LDAP bind failed: " + error);
    }
}

export function unbind() {
    client.unbind();
}


export async function search(filter: string, base: string) {
    console.log("Searching LDAP server...")
    let result
    await client.search(base, {
        filter: filter,
    }).then((res) => {
        result = res.searchEntries
        console.log(res.searchEntries)
        console.log(res.searchReferences)
    })
    console.log("LDAP search successful")
    return result
}