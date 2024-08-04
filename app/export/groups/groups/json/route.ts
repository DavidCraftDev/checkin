import { getSessionUser } from "@/app/src/modules/authUtilities"
import { getGroupsWithUserData } from "@/app/src/modules/groupUtilities";
import { NextResponse } from "next/server";

export async function GET() {
    const user = await getSessionUser(2);
    const groups = await getGroupsWithUserData()
    groups.map(group => {
        group.members.map(member => {
            member.password = null
            member.loginVersion = 0
        })
    })
    const data = new Array()
    data.push({
        meta: {
            type: "groups",
            exportedEntries: groups.length,
            requestedBy: user.id,
            time: new Date()
        }
    })
    data.push(groups)
    return NextResponse.json(data)
}