import getLdapClient from "@/app/src/modules/ldap";
import ldapClient from "@/app/src/modules/ldap";
import { isLDAPEnabled } from "@/app/src/modules/ldapUtilities";

export default async function TestPage() {
    if(!isLDAPEnabled()) {
        return (
            <div>
            <h1>Test Page</h1>
            <p>{process.env.ldap}</p>
            </div>
        );
    }
    let data = await getLdapClient();
    return (
        <div>
        <h1>Test Page</h1>
        <p>{data}</p>
        </div>
    );
}