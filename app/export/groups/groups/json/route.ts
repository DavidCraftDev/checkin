import { getSesessionUser } from "@/app/src/modules/authUtilities"
import { getAllGroups } from "@/app/src/modules/groupUtilities";

import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const user = await getSesessionUser(2);
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