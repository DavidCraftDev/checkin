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

export async function convertGUID(rawGUID: any) {
    const hex = Buffer.from(rawGUID, 'binary').toString('hex');

    const p1 =
        hex.slice(-26, 2) +
        hex.slice(-28, 2) +
        hex.slice(-30, 2) +
        hex.slice(-32, 2);

    const p2 = hex.slice(-22, 2) + hex.slice(-24, 2);
    const p3 = hex.slice(-18, 2) + hex.slice(-20, 2);
    const p4 = hex.slice(-16, 4);
    const p5 = hex.slice(-12, 12);

    return [p1, p2, p3, p4, p5].join('-') as string;
}

process.on('exit', async () => {
    await unbind();
});