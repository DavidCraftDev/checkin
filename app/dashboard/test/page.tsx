import { convertGUIDToString, search } from "@/app/src/modules/ldap";

export default async function TestPage() {
    if (process.env.USE_LDAP !== "true") {
        return (
            <div>
                <h1>Test Page</h1>
                <p>State: {process.env.USE_LDAP}</p>
            </div>
        );
    }
    if (!process.env.LDAP_SEARCH_BASE || !process.env.LDAP_SEARCH_BASE) throw new Error("LDAP search filter and base are required");
    let data: any[] = await search(process.env.LDAP_SEARCH_BASE, process.env.LDAP_SEARCH_BASE);
    data.forEach(async (entry) => {
        console.log(entry)
    });
    let newData: any[] = await search("(|(sAMAccountName=ntadmin)(mail=ntadmin))", process.env.LDAP_SEARCH_BASE);
    return (
        <div>
            <h1>Test Page</h1>
            <p>State: {process.env.USE_LDAP}</p>
            <p>{newData[0].displayName}</p>
            <p>{newData[0].sAMAccountName}</p>
            <p>{await convertGUIDToString(newData[0].objectGUID)}</p>
            <p>{(newData[0].objectGUID as Buffer).toString("hex")}</p>
            <p>----</p>
            {data.map(async (entry) => {
                return (
                    <div key={entry.objectGUID}>
                        <p>{await convertGUIDToString(entry.objectGUID)}</p>
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