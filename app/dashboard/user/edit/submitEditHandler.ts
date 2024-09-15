'use server'

import { use_ldap } from "@/app/src/modules/config";
import { updateUser } from "@/app/src/modules/userUtilities";

export async function submitEditHandler(formdata: FormData, id: string) {
    const displayname = formdata.get('displayname') as string;
    let username = formdata.get('username') as string;
    const permission = formdata.get('permission') as string;
    const groupData = formdata.get('group') as string;
    const group = groupData.split(",") as string[];
    const password = formdata.get('password') as string;
    const needsData = formdata.get('needs') as string;
    let needsArray = [] as string[];
    if (needsData) needsArray = needsData.split(",") as string[];
    const competenceData = formdata.get('competence') as string;
    let competenceArray = [] as string[];
    if (competenceData) competenceArray = competenceData.split(",") as string[];
    if (!displayname) return "displayname"
    //Username only letters, numbers and dots
    if (!/^[a-zA-Z0-9.]*$/.test(username)) return "username"
    if (use_ldap) username = "local/" + username
    const data = await updateUser(id, username, displayname, parseInt(permission), group, needsArray, competenceArray, password)
    if (data === "exist") return "exist"
    return "success"
}
