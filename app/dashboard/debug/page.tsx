import { use_ldap } from "@/app/src/modules/config";
import { getAllUsers } from "@/app/src/modules/ldapUtilities";
import { notFound } from "next/navigation";

export async function debugPage() {
    if(!use_ldap) return notFound();
    const data = await getAllUsers();
    return (
        <div>
            <h1>Debug</h1>
            <p>Debugging page</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}