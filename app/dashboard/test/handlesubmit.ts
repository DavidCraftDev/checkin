"use server"

import { search } from "@/app/src/modules/ldap";

export async function handleSubmit(event: any) {
    event.preventDefault();
    const data = new FormData(event.target);
    const filter = data.get('filter') as string;
    const base = data.get('base') as string;
    //const attributes = data.get('attributes') as string;
    search(filter, base, ['dn', 'sn', 'cn']).then((result) => {
        return (JSON.stringify(result, null, 2)) as string;
    }).catch((error) => {
        return ("Error: " + error) as string;
    });
}