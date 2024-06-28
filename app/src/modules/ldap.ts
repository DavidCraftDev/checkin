import { Client } from 'ldapts';
import { isLDAPEnabled } from './ldapUtilities';
import uuid from 'uuid';

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
        explicitBufferAttributes: ['objectGUID']
    })
    return searchEntries
}

export async function convertGUID(guidRaw: Buffer) {
    const hex = (guidRaw as Buffer).toString("hex")
    let formattedGUID = `${hex.substring(6, 8)}${hex.substring(4, 6)}${hex.substring(2, 4)}${hex.substring(0, 2)}-` +
        `${hex.substring(10, 12)}${hex.substring(8, 10)}-` +
        `${hex.substring(14, 16)}${hex.substring(12, 14)}-` +
        `${hex.substring(16, 20)}-` +
        `${hex.substring(20)}`
    return formattedGUID;
}

process.on('exit', async () => {
    await unbind();
});