import { Client, createClient } from 'ldapjs';
import { isLDAPEnabled } from './ldapUtilities';

let ldapClient: Client | null = null;

console.log('LDAP enabled:', isLDAPEnabled())

async function getLdapClient() {
    if(!process.env.LDAP_URI && isLDAPEnabled()) throw new Error('LDAP_URI is required')
        else if(!process.env.LDAP_URI?.startsWith('ldap://') && !process.env.LDAP_URI?.startsWith("ldaps://") && isLDAPEnabled()) throw new Error('LDAP_URI must start with ldap://')
        else if(isLDAPEnabled()){
            const tlsOptions = { 'rejectUnauthorized': false }
            try {
            ldapClient = createClient({
                url: process.env.LDAP_URI as string,
                reconnect: true,
                tlsOptions: tlsOptions
            });
            } catch (error) {
                throw new Error('LDAP_URI is invalid: ' + error)
            }
            if(!process.env.LDAP_BIND_DN) return 'LDAP_BIND_DN is required' as string
            if(!process.env.LDAP_BIND_CREDENTIALS) return 'LDAP_BIND_CREDENTIALS is required' as string
            let result: string = 'Binding to LDAP server...'
            ldapClient.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_CREDENTIALS, (error: any) => {
                if(error) result = error as string
                else result = "LDAP bind successful" as string
                ldapClient?.unbind()
            })
            return result
        }
}

export default getLdapClient