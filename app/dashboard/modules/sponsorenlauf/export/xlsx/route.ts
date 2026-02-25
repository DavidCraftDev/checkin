import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import { readData } from "@/app/dashboard/modules/sponsorenlauf/handler";
import { getUsersByID } from "@/app/src/modules/userUtilities";
import writeXlsxFile, { SheetData } from "write-excel-file/node";
import { NextResponse } from "next/server";

export async function GET() {
    // This route is used to export the round data as XLSX
    const { user } = await getCurrentSession();
    if (!user) return new Response("401 Unauthorized", { status: 401 });
    if (user.permission < 1) return new Response("403 Forbidden", { status: 403 });
    const fileData = await readData();
    // Get User Data for every userID in the data
    const userIDs = Object.keys(fileData);
    const dbUsers = await getUsersByID(userIDs);
    const userMap = new Map(dbUsers.map((u) => [u.id, u]));
    const userData: UserData[] = []
    for (const userID of userIDs) {
        const user = userMap.get(userID);
        if (user) {
            userData.push({
                userID: userID,
                displayName: user.displayname,
                group: user.permission === 0 ? user.group[0] : "Lehrer",
                roundCount: fileData[userID],
            });
        } else {
            userData.push({
                userID: userID,
                displayName: "Unbekannter Benutzer",
                group: "Unbekannt",
                roundCount: fileData[userID],
            });
        }
    }

    // Sort by round count descending, then by display name ascending
    userData.sort((a, b) => {
        if (b.roundCount !== a.roundCount) {
            return b.roundCount - a.roundCount;
        }
        return a.displayName.localeCompare(b.displayName);
    });

    // Create XLSX file
    const sheetData: SheetData[] = []
    const sheetNames: Array<string> = []
    const columnData: Array<{ width: number }[]> = []

    const allUserSheetData: SheetData = [];
    allUserSheetData.push([
        {
            type: String,
            value: "Sponsorenlauf Teilnehmer Übersicht",
            fontWeight: "bold"
        }
    ]);
    allUserSheetData.push([]);
    allUserSheetData.push([
        {
            type: String,
            value: "Name",
            fontWeight: "bold"
        },
        {
            type: String,
            value: "Klasse",
            fontWeight: "bold"
        },
        {
            type: String,
            value: "Runden",
            fontWeight: "bold"
        }
    ]);
    userData.forEach((user: UserData) => {
        allUserSheetData.push([
            {
                type: String,
                value: user.displayName
            },
            {
                type: String,
                value: user.group
            },
            {
                type: Number,
                value: user.roundCount
            }
        ]);
    });
    sheetData.push(allUserSheetData);
    sheetNames.push("Teilnehmer Übersicht");
    columnData.push([
        { width: 30 },
        { width: 20 },
        { width: 10 }
    ]);

    const groups = new Set(userData.map(user => user.group));
    groups.forEach(group => {
        const groupSheetData: SheetData = [];
        groupSheetData.push([
            {
                type: String,
                value: "Sponsorenlauf Teilnehmer Übersicht - " + group,
                fontWeight: "bold"
            }
        ]);
        groupSheetData.push([]);
        groupSheetData.push([
            {
                type: String,
                value: "Name",
                fontWeight: "bold"
            },
            {
                type: String,
                value: "Runden",
                fontWeight: "bold"
            }
        ]);
        userData.filter((user: UserData) => user.group === group).forEach((user: UserData) => {
            groupSheetData.push([
                {
                    type: String,
                    value: user.displayName
                },
                {
                    type: Number,
                    value: user.roundCount
                }
            ]);
        });
        sheetData.push(groupSheetData);
        sheetNames.push(group);
        columnData.push([
            { width: 30 },
            { width: 10 }
        ]);
    });

    const buffer = await writeXlsxFile(sheetData, { buffer: true, sheets: sheetNames, columns: columnData })
    return new NextResponse(new Uint8Array(buffer), {
        headers: {
            "Content-Type": 'application/vnd.ms-excel',
            "Content-Disposition": 'attachment; filename="sponsorenlauf_data.xlsx"',
        },
    });
}

interface UserData {
    userID: string;
    displayName: string;
    group: string;
    roundCount: number;
}