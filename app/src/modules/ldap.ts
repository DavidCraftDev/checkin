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
    const data = Buffer.from(rawGUID, 'binary');
    
    var template = '{3}{2}{1}{0}-{5}{4}-{7}{6}-{8}{9}-{10}{11}{12}{13}{14}{15}';
    for ( var i = 0; i < data.length; i++ ) {
        var dataStr = data[ i ].toString( 16 );
        dataStr = data[ i ] >= 16 ? dataStr : '0' + dataStr;
        template = template.replace( new RegExp( '\\{' + i + '\\}', 'g' ), dataStr );
    }
    return template;
}

process.on('exit', async () => {
    await unbind();
});