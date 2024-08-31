import { use_ldap } from "@/app/src/modules/config";
import { search } from "@/app/src/modules/ldapUtilities";
import { notFound } from "next/navigation";

export default async function debugPage() {
    if(!use_ldap) return notFound();
    const data = await search("(OU=Classes)");
    return (
        <div>
            <h1>Debug</h1>
            <p>Debugging page</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
