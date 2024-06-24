import { connectAndBindToLdap } from "@/app/src/modules/ldap";
import { isLDAPEnabled } from "@/app/src/modules/ldapUtilities";

export default async function TestPage() {
    if(!isLDAPEnabled()) {
        return (
            <div>
            <h1>Test Page</h1>
            <p>State: {process.env.ldap}</p>
            </div>
        );
    }
    let data = await connectAndBindToLdap(process.env.LDAP_URI || "ERROR", process.env.LDAP_BIND_DN || "Error", process.env.LDAP_BIND_CREDENTIALS || "Error");
    return (
        <div>
        <h1>Test Page</h1>
        <p>State: {process.env.ldap}</p>
        <p>{data.success}</p>
        <p>{data.message}</p>
        </div>
    );
}