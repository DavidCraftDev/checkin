import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import { getUserOverviewDataXLSX } from "@/app/src/modules/export/overview/user/xlsx";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";
import writeXlsxFile from "write-excel-file/node";

export async function GET(request: NextRequest) {
    // Get the current user and check if there a allowed to access this route
    const { user } = await getCurrentSession();
    if (!user) return new NextResponse("401 Unauthorized", { status: 401 });
    if (user.permission < 1) return new NextResponse("403 Forbidden", { status: 403 });

    // Get search parameters
    const searchParams = request.nextUrl.searchParams;
    const userID = searchParams.get("userID") || user.id;
    const startCW = Number(searchParams.get("startCW")) || dayjs().isoWeek();
    const startYear = Number(searchParams.get("startYear")) || dayjs().year();
    const endCW = Number(searchParams.get("endCW")) || startCW;
    const endYear = Number(searchParams.get("endYear")) || startYear;

    // Get the XLSX data (getUserOverviewDataXLSX)
    const overviewData = await getUserOverviewDataXLSX(userID, startCW, startYear, endCW, endYear);
    if (!overviewData) return new NextResponse("404 Not Found", { status: 404 });

    const bufferData = await writeXlsxFile(overviewData.sheetData, { buffer: true, sheets: overviewData.sheetName, columns: overviewData.columeData })
    return new NextResponse(bufferData, {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="overview${userID + "_" + startCW + startYear + "_" + endCW + endYear}.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
    })
}