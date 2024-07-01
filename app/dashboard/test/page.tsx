import { convertGUIDToString, getAllUsers, search } from "@/app/src/modules/ldap";

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
    let data: any[] = await getAllUsers();
    data.forEach(async (entry) => {
        if (entry.sAMAccountName === "sascha.meyer") {
            console.log(entry);
        }
        entry.memberOf.map(async (group: string) => {
            let data = group.split(",")
            console.log(data[1].replace("OU=", "") + ": " + data[0].replace("CN=", ""))
        });
    });
    let newData: any[] = await search("(cn=Team Oberstufe)", process.env.LDAP_SEARCH_BASE);
    console.log(newData);
    return (
        <div>
            <h1>Test Page</h1>
            <p>State: {process.env.USE_LDAP}</p>
            {data.map(async (entry) => {
                return (
                    <div key={entry.objectGUID}>
                        <p>{entry.objectGUID}</p>
                        <p>{entry.sAMAccountName}</p>
                        <p>{entry.displayName}</p>
                        <p>{entry.pwdLastSet}</p>
                        {entry.memberOf.map((group: string) => {
                            return (
                                <p key={group}>{group}</p>
                            );
                        }
                        )}
                        <p>----</p>
                    </div>
                );
            })
            }
        </div>
    );
}