import { getSessionUser } from "@/app/src/modules/authUtilities"
import { getGroupsWithUserData } from "@/app/src/modules/groupUtilities";
import { NextResponse } from "next/server";
import { Columns, SheetData } from "write-excel-file";
import writeXlsxFile from "write-excel-file/node";

export async function GET() {
    const user = await getSessionUser(2);

    const groups = await getGroupsWithUserData()
    const sheetData: SheetData[] = new Array()
    const sheetName: Array<string> = new Array()
    const columeData: Columns[] = new Array()
    const meta = new Array()
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
    columeData.push([
        { width: 20 },
        { width: 20 },
        { width: 20 }
    ]);
    for (const group of groups) {
        const groupData = new Array()
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
        if (sheetName.includes(group.group)) {
            for (let i = 1; i < 9999; i++) {
                if (!sheetName.includes(group.group + " (" + i + ")")) {
                    sheetName.push(group.group + " (" + i + ")")
                    break
                }
            }
        } else {
            sheetName.push(group.group)
        }
        columeData.push([
            { width: 20 },
            { width: 20 },
            { width: 20 }
        ]);
    }
    const bufferData = await writeXlsxFile(sheetData, { buffer: true, sheets: sheetName, columns: columeData })
    return new NextResponse(bufferData, {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="groups.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
    })
}