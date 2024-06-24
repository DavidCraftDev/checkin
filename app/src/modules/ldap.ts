// TypeScript code to connect to an LDAP server and attempt to bind. 
// All errors and results are returned as the function result.

import { createClient } from 'ldapjs';

interface LdapConnectionResult {
  success: boolean;
  message: string;
}

export async function connectAndBindToLdap(ldapUri: string, bindDn: string, bindCredentials: string): Promise<LdapConnectionResult> {
  // Validate input parameters
  if (!ldapUri.startsWith('ldap://') && !ldapUri.startsWith('ldaps://')) {
    return { success: false, message: 'LDAP_URI must start with ldap:// or ldaps://' };
  }
  if (!bindDn) {
    return { success: false, message: 'LDAP_BIND_DN is required' };
  }
  if (!bindCredentials) {
    return { success: false, message: 'LDAP_BIND_CREDENTIALS is required' };
  }

  // Create LDAP client with TLS options
  const tlsOptions = { rejectUnauthorized: false };
  let ldapClient;
  try {
    ldapClient = createClient({
      url: ldapUri,
      reconnect: true,
      tlsOptions: tlsOptions
    });
  } catch (error) {
    return { success: false, message: 'Failed to create LDAP client: ' + error };
  }

  // Attempt to bind with the provided DN and credentials
  try {
    await new Promise((resolve, reject) => {
      ldapClient.bind("CN=" + bindDn, bindCredentials, (error: any) => {
        if (error) reject(error);
        else resolve("LDAP bind successful");
      });
    });
    // Unbind after successful bind
    ldapClient.unbind();
    return { success: true, message: 'LDAP bind successful' };
  } catch (error) {
    ldapClient.unbind();
    return { success: false, message: 'LDAP bind failed: ' + error };
  }
}