'use server'

import { updateUser } from "@/app/src/modules/userUtilities";


export async function submitEditHandler(formdata: FormData, id: string) {
    const displayname = formdata.get('displayname') as string || "_";
    const username = formdata.get('username') as string || "_";
    const permission = formdata.get('permission') as string;
    const group = formdata.get('group') as string;
    const password = formdata.get('password') as string;
    const passwordAgain = formdata.get('passwordAgain') as string;
    //Displayname only letters and spaces
    if (!/^[a-zA-Z\s]*$/.test(displayname)) {
         return "displayname"
    }
    //Username only letters and dots
    if (!/^[a-zA-Z.]*$/.test(username)) {
        return "username"
    }
    if(password && (password !== passwordAgain)) {
        return "passwordAgain"
    }
    const data = await updateUser(id, username, displayname, parseInt(permission), group, password)
    if(data === "exist") return "exist"
    return "success"
}
