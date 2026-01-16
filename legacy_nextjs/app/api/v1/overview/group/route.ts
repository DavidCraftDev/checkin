import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import { getGroupUsers } from "@/app/src/modules/group";
import { getSortedGroupOverviewData } from "@/app/src/modules/overview/group";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    // Get the current user and check if there a allowed to access this route
    const { user } = await getCurrentSession();
    if (!user) return new NextResponse("401 Unauthorized", { status: 401 });
    if (user.permission < 1) return new NextResponse("403 Forbidden", { status: 403 });

    // Get search parameters
    const searchParams = request.nextUrl.searchParams;
    const groupID = searchParams.get("groupID") || user.group[0];
    const startCW = Number(searchParams.get("startCW")) || dayjs().isoWeek();
    const startYear = Number(searchParams.get("startYear")) || dayjs().year();
    const endCW = Number(searchParams.get("endCW")) || startCW;
    const endYear = Number(searchParams.get("endYear")) || startYear;

    // Check if the user is allowed to view this data
    if (!user.group.includes(groupID) && user.permission < 2) return new NextResponse("403 Forbidden", { status: 403 });

    // Get the overview data
    const overviewData = await getSortedGroupOverviewData(groupID, startCW, startYear, endCW, endYear);

    // Check if the user is allowed to view this data and if the user exists
    if (!overviewData) {
        const groupData = await getGroupUsers(groupID);
        if (!groupData) return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(overviewData);
}
