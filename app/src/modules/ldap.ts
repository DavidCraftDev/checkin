import { Client, createClient } from 'ldapjs';
import { isLDAPEnabled } from './ldapUtilities';

let client: Client;

if (isLDAPEnabled()) {
    if (!process.env.LDAP_URI) throw new Error("LDAP_URI is required");
    if (!process.env.LDAP_BIND_DN) throw new Error("LDAP_BIND_DN is required");
    if (!process.env.LDAP_BIND_CREDENTIALS) throw new Error("LDAP_BIND_CREDENTIALS is required");
    //if (!process.env.LDAP_URI.startsWith('ldap://')) throw new Error("LDAP_URI must start with ldap:// or ldaps://");
    console.log("Connect to LDAP Server " + process.env.LDAP_URI + "...")
    const tlsOptions = { rejectUnauthorized: false };
    try {
        client = createClient({
            url: process.env.LDAP_URI,
            reconnect: true,
            tlsOptions: tlsOptions
        });
    } catch (error) {
        throw new Error("Failed to create LDAP client: " + error);
    }
    console.log("LDAP client created successfully!")

    console.log("Bind to LDAP Server...")
    try {
        client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_CREDENTIALS, (error: any) => {
            if (error) throw new Error("LDAP bind failed: " + error);
            console.log("LDAP bind successful")
        });
    } catch (error) {
        throw new Error("LDAP bind failed: " + error);
    }
}

export function unbind() {
    client.unbind((error: any) => {
        if (error) throw new Error("LDAP unbind failed: " + error);
        console.log("LDAP unbind successful")
    });
}


export async function search(filter: string, base: string) {
    return new Promise((resolve, reject) => {
        client.search(base, {
            filter: filter,
            scope: 'sub',
            attributes: ['cn', 'sn', 'mail']
        }, (error: any, res: any) => {
            if (error) {
                reject(error);
            }
            res.on('searchRequest', (searchRequest: any) => {
                console.log('searchRequest: ', searchRequest.messageId);
              });
            let items: any[] = [];
            res.on('searchEntry', (entry: any) => {
                console.log('entry: ' + JSON.stringify(entry));
                items.push(entry);
            });
            res.on('error', (err: any) => {
                console.error('error: ' + err.message);
              });
            res.on('end', (result: any) => {
                console.log('search done');
                console.log(result.status)
                console.log(items)
                resolve(items);
            });
        });
    }
    );
}

export async function testFunction() {
    if(!process.env.test) throw new Error("LDAP test base is required");
    return await search('(OU=Classes)', process.env.test)
}