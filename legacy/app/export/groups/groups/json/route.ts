import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import { getGroupsWithUserData } from "@/app/src/modules/groupUtilities";
import { NextResponse } from "next/server";

export async function GET() {
    const { user } = await getCurrentSession();
    if(!user) return new NextResponse(null, { status: 401 });
    if(user.permission < 2) return new NextResponse(null, { status: 403 });
    const groups = await getGroupsWithUserData()
    groups.map(group => {
        group.members.map(member => {
            member.password = null
            member.pwdLastSet = new Date();
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