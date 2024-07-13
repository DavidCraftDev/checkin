import { Client } from 'ldapts';
import { ldap_bind_dn, ldap_bind_password, ldap_tls_reject_unauthorized, ldap_search_base, ldap_uri, ldap_user_search_filter, use_ldap } from './config';
import { existsSync, readFileSync } from 'fs';

let client: Client

if (use_ldap) {
    console.log("Connect to LDAP Server " + ldap_uri + "...")
    let certExists = existsSync("../../../cert.crt")
    console.log(process.cwd())
    let tlsOptions
    console.log(certExists)
    if (certExists) {
        tlsOptions = {
            rejectUnauthorized: ldap_tls_reject_unauthorized,
            ca: [readFileSync("../../../cert.crt").toString()]
        }
        console.log(readFileSync("../../../cert.crt").toString())
    } else {
        tlsOptions = {
            rejectUnauthorized: ldap_tls_reject_unauthorized
        }
    }
    try {
        client = new Client({
            url: ldap_uri,
            tlsOptions: tlsOptions
        });
    } catch (error) {
        throw new Error("Failed to create LDAP client: " + error);
    }
    console.log("LDAP client created successfully!")
}

async function bind() {
    console.log("Bind to LDAP Server...")
    try {
        await client.bind(ldap_bind_dn, ldap_bind_password);
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
    const data = await search(ldap_user_search_filter, ldap_search_base)
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