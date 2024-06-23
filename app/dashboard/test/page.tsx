import ldapClient from "@/app/src/modules/ldap";
import { isLDAPEnabled } from "@/app/src/modules/ldapUtilities";

export default function TestPage() {
    if(isLDAPEnabled()) {
        let client = ldapClient
    }
    return (
        <div>
        <h1>Test Page</h1>
        <p>This is a test page.</p>
        </div>
    );
}