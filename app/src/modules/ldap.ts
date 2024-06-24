import { Client, createClient } from 'ldapjs';
import { isLDAPEnabled } from './ldapUtilities';

console.log('LDAP enabled:', isLDAPEnabled())
console.log('LDAP URI:', process.env.LDAP_URI)
console.log('LDAP BIND DN:', process.env.LDAP_BIND_DN)
console.log('LDAP BIND CREDENTIALS:', process.env.LDAP_BIND_CREDENTIALS)

async function getLdapClient() {
    if (!process.env.LDAP_URI && isLDAPEnabled()) throw new Error('LDAP_URI is required');
    else if (!process.env.LDAP_URI?.startsWith('ldap://') && !process.env.LDAP_URI?.startsWith("ldaps://") && isLDAPEnabled()) throw new Error('LDAP_URI must start with ldap://');
    else if (isLDAPEnabled()) {
        const tlsOptions = { 'rejectUnauthorized': false };
        let ldapClient;
        try {
            ldapClient = createClient({
                url: process.env.LDAP_URI as string,
                reconnect: true,
                tlsOptions: tlsOptions
            });
        } catch (error) {
            throw new Error('LDAP_URI is invalid: ' + error);
        }
        if (!process.env.LDAP_BIND_DN) return 'LDAP_BIND_DN is required'
        if (!process.env.LDAP_BIND_CREDENTIALS) return 'LDAP_BIND_CREDENTIALS is required'
        let data = await new Promise((resolve, reject) => {
            ldapClient.bind(process.env.LDAP_BIND_DN || "ND", process.env.LDAP_BIND_CREDENTIALS || "ND", (error: any) => {
                if (error) reject(error);
                else resolve("LDAP bind successful");
            });
        });

        ldapClient.unbind();
        return "LDAP bind successful" + data;
    }
}

export default getLdapClient