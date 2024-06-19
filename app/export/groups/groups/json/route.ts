import { getSessionUser } from "@/app/src/modules/authUtilities"
import { getAllGroups } from "@/app/src/modules/groupUtilities";

export async function GET() {
    const user = await getSessionUser(2);
    user.password = undefined
    user.loginVersion = undefined

    const groups = await getAllGroups()
    const data = new Array()
    data.push({
        meta: {
            type: "groups",
            exportedEntries: groups.length,
            requestedBy: user.id,
            time: new Date()
        }
    })
    data.push(groups, user)
    return Response.json(data)
}