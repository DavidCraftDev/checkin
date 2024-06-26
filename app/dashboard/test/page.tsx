
import { search } from "@/app/src/modules/ldap";
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
    if(!process.env.example || !process.env.test) throw new Error("LDAP search filter and base are required");
    let data: any[] = await search(process.env.example, process.env.test);
    console.log(data)
    return (
        <div>
        <h1>Test Page</h1>
        <p>State: {process.env.ldap}</p>
        <p>{String(data[0].displayName)}</p>
        </div>
    );
}