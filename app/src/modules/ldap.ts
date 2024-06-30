import { Client } from 'ldapts';

let client: Client

if (process.env.USE_LDAP == "true") {
    if (!process.env.LDAP_URI) throw new Error("LDAP_URI is required");
    if (!process.env.LDAP_BIND_DN) throw new Error("LDAP_BIND_DN is required");
    if (!process.env.LDAP_BIND_PASSWORD) throw new Error("LDAP_BIND_PASSWORD is required");
    if (!process.env.LDAP_URI.startsWith('ldap://') && !process.env.LDAP_URI.startsWith('ldaps://')) throw new Error("LDAP_URI must start with ldap:// or ldaps://");
    if (!process.env.LDAP_SEARCH_BASE) throw new Error("LDAP_SEARCH_BASE is required");
    if (!process.env.LDAP_SEARCH_FILTER) throw new Error("LDAP_SEARCH_FILTER is required");
    console.log("Connect to LDAP Server " + process.env.LDAP_URI + "...")
    const tlsOptions = { rejectUnauthorized: false }; // Future: Add support for custom CA certificates
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
    console.log("Unbind from LDAP Server...")
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

export async function getAllUsers() {
    if (!process.env.LDAP_SEARCH_BASE) throw new Error("LDAP_SEARCH_BASE is required");
    if (!process.env.LDAP_SEARCH_FILTER) throw new Error("LDAP_SEARCH_FILTER is required");
    const data = await search(process.env.LDAP_SEARCH_FILTER, process.env.LDAP_SEARCH_BASE)
    await Promise.all(data.map(async (entry) => {
        entry.objectGUID = await convertGUIDToString(entry.objectGUID as Buffer);
    }));
    return data;
}

export async function convertGUIDToString(guidRaw: Buffer) {
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