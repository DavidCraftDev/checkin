import { Client, createClient } from 'ldapjs';
import { isLDAPEnabled } from './ldapUtilities';

let ldapClient: Client | null = null;

if(!process.env.LDAP_URI && isLDAPEnabled()) throw new Error('LDAP_URI is required')
else if(!process.env.LDAP_URI?.startsWith('ldap://') && !process.env.LDAP_URI?.startsWith("ldaps://") && isLDAPEnabled()) throw new Error('LDAP_URI must start with ldap://')
else if(isLDAPEnabled()){
    try {
    ldapClient = createClient({
        url: process.env.LDAP_URI,
        reconnect: true
    });
    } catch (error) {
        throw new Error('LDAP_URI is invalid: ' + error)
    }
    if(!process.env.LDAP_BIND_DN) throw new Error('LDAP_BIND_DN is required')
    if(!process.env.LDAP_BIND_CREDENTIALS) throw new Error('LDAP_BIND_CREDENTIALS is required')
    ldapClient.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_CREDENTIALS, (error: any) => {
        if(error) console.log(error)
        else console.log('LDAP bind successful')
        ldapClient?.unbind()
    })
}

export default ldapClient;