import { convertGUID, search } from "@/app/src/modules/ldap";
import { isLDAPEnabled } from "@/app/src/modules/ldapUtilities";
import { UuidTool } from "uuid-tool";

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
    data.forEach(async (entry) => {
        console.log(String(entry.objectGUID))
    });
    return (
        <div>
        <h1>Test Page</h1>
        <p>State: {process.env.ldap}</p>
        {data.map(async (entry) => {
            return (
                <div key={entry.objectGUID}>
                    <p>{entry.objectGUID}</p>
                    <p>{entry.sAMAccountName}</p>
                    <p>{entry.displayName}</p>
                    <p>{entry.pwdLastSet}</p>
                    <p>----</p>
                </div>
            );
        })
        }
        </div>
    );
}