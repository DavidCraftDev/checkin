import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import { getGroupsWithUserData } from "@/app/src/modules/groupUtilities";
import { NextResponse } from "next/server";
import writeXlsxFile, { SheetData } from "write-excel-file/node";

export async function GET() {
    const { user } = await getCurrentSession();
    if (!user) return new NextResponse(null, { status: 401 });
    if (user.permission < 2) return new NextResponse(null, { status: 403 });

    const groups = await getGroupsWithUserData()
    const sheetData: SheetData[] = []
    const sheetName: Array<string> = []
    const columnData: Array<{ width: number }[]> = []
    const meta: SheetData = []
    meta.push([{
        "type": String,
        "value": "Alle Gruppen",
        "fontWeight": "bold"
    }])
    meta.push([{
        "type": String,
        "value": "Exportiert am:",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Exportierte Einträge:",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Exportiert von:",
        "fontWeight": "bold"
    }])
    meta.push([{
        "type": Date,
        "value": new Date(),
        "format": "DD.MM.YYYY HH:mm"
    },
    {
        "type": Number,
        "value": groups.length
    },
    {
        "type": String,
        "value": user.displayname
    }])
    meta.push([{}])
    meta.push([{
        "type": String,
        "value": "Gruppe",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Teilnehmer",
        "fontWeight": "bold"
    }])
    groups.forEach((group) => {
        meta.push([{
            "type": String,
            "value": group.group,
            "wrap": true
        },
        {
            "type": Number,
            "value": group.members.length,
        }])
    })
    sheetData.push(meta)
    sheetName.push("Meta")
    columnData.push([
        { width: 20 },
        { width: 20 },
        { width: 20 }
    ]);
    for (const group of groups) {
        const groupData: SheetData = []
        groupData.push([{
            "type": String,
            "value": group.group,
            "fontWeight": "bold"
        }])
        groupData.push([{
            "type": String,
            "value": "Exportiert am:",
            "fontWeight": "bold"
        },
        {
            "type": String,
            "value": "Exportierte Einträge:",
            "fontWeight": "bold"
        },
        {
            "type": String,
            "value": "Exportiert von:",
            "fontWeight": "bold"
        }])
        groupData.push([{
            "type": Date,
            "value": new Date(),
            "format": "DD.MM.YYYY HH:mm"
        },
        {
            "type": Number,
            "value": group.members.length
        },
        {
            "type": String,
            "value": user.displayname
        }])
        groupData.push([{}])
        groupData.push([{
            "type": String,
            "value": "Name",
            "fontWeight": "bold"
        },
        {
            "type": String,
            "value": "Nutzername",
            "fontWeight": "bold"
        }])
        group.members.forEach((member) => {
            groupData.push([{
                "type": String,
                "value": member.displayname
            },
            {
                "type": String,
                "value": member.username
            }])
        })
        sheetData.push(groupData)
        if (sheetName.includes(group.group.substring(0, 31))) {
            for (let i = 1; i < 9999; i++) {
                if (!sheetName.includes(group.group.substring(0, 27) + " (" + i + ")")) {
                    sheetName.push(group.group.substring(0, 27) + " (" + i + ")")
                    break
                }
            }
        } else {
            sheetName.push(group.group.substring(0, 31))
        }
        columnData.push([
            { width: 20 },
            { width: 20 },
            { width: 20 }
        ]);
    }
    const bufferData = await writeXlsxFile(sheetData, { buffer: true, sheets: sheetName, columns: columnData })
    return new NextResponse(new Uint8Array(bufferData), {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="groups.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
    })
}