'use server'

import { createUser } from "@/app/src/modules/userUtilities";


export async function submitCreateHandler(formdata: FormData) {
    const displayname = formdata.get('displayname') as string || "_";
    const username = formdata.get('username') as string || "_";
    const permission = formdata.get('permission') as string;
    const group = formdata.get('group') as string;
    const password = formdata.get('password') as string;
    //Displayname only letters and spaces
    if (!/^[a-zA-Z\s]*$/.test(displayname)) {
         return "displayname"
    }
    //Username only letters and dots
    if (!/^[a-zA-Z.]*$/.test(username)) {
        return "username"
    }
    if(!password) {
        return "password"
    }
    const data = await createUser(username, displayname, parseInt(permission), group, password)
    if(data === "exist") return "exist"
    return "success"
}
