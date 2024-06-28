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
}
async function bind() {
    console.log("Bind to LDAP Server...")
    if (!process.env.LDAP_BIND_DN) throw new Error("LDAP_BIND_DN is required");
    try {
        await client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_CREDENTIALS);
        console.log("LDAP bind successful")
    } catch (error) {
        throw new Error("LDAP bind failed: " + error);
    }
}

export async function unbind() {
    await client.unbind();
}


export async function search(filter: string, base: string) {
    if (!client.isConnected) {
        await bind()
    }
    const { searchEntries, searchReferences } = await client.search(base, {
        scope: 'sub',
        filter: filter,
    })
    return searchEntries
}

export async function convertGUID(guidRaw: string) {
    const hexParts = [];
    for (const byte of guid) {
        hexParts.push(('00' + byte.toString(16)).slice(-2));
    }

    // Join the hexadecimal parts into the UUID format (8-4-4-4-12)
    return [
        hexParts.slice(0, 4).join(''), // 8 characters
        hexParts.slice(4, 6).join(''), // 4 characters
        hexParts.slice(6, 8).join(''), // 4 characters
        hexParts.slice(8, 10).join(''), // 4 characters
        hexParts.slice(10, 16).join(''), // 12 characters
    ].join('-');
}

process.on('exit', async () => {
    await unbind();
});