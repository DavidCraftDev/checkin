'use server'

import { use_ldap } from "@/app/src/modules/config";
import { updateUser } from "@/app/src/modules/userUtilities";
import { Prisma } from "@prisma/client";

export async function submitEditHandler(formdata: FormData, id: string) {
    const displayname = formdata.get('displayname') as string;
    let username = formdata.get('username') as string;
    const permission = formdata.get('permission') as string;
    const group = formdata.get('group') as string;
    const password = formdata.get('password') as string;
    const needsData = formdata.get('needs') as string;
    let needsArray = [] as Prisma.JsonArray;
    if(needsData) needsArray = needsData.split(",") as Prisma.JsonArray;
    const competenceData = formdata.get('competence') as string;
    let competenceArray = [] as Prisma.JsonArray;
    if(competenceData) competenceArray = competenceData.split(",") as Prisma.JsonArray;
    if (!displayname) return "displayname"
    //Username only letters, numbers and dots
    if (!/^[a-zA-Z0-9.]*$/.test(username)) return "username"
    if(use_ldap) username = "local/" + username
    const data = await updateUser(id, username, displayname, parseInt(permission), group, needsArray, competenceArray, password)
    if (data === "exist") return "exist"
    return "success"
}
