import { testFunction } from "@/app/src/modules/ldap";
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
let data = await testFunction().then((data) => String(data))
    return (
        <div>
        <h1>Test Page</h1>
        <p>State: {process.env.ldap}</p>
        <p>{data}</p>
        </div>
    );
}