import { getSesessionUser } from "@/app/src/modules/authUtilities"
import { getAllGroups } from "@/app/src/modules/groupUtilities";
import { NextRequest } from "next/server";
import writeXlsxFile from "write-excel-file/node";

export async function GET(request: NextRequest) {
    const user = await getSesessionUser(2);

    const groups = await getAllGroups()
    const data = new Array()
    const sheetData = new Array()
    const columeData = new Array()
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
    groups.forEach((group: any) => {
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
    data.push(meta)
    sheetData.push("Meta")
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
        group.members.forEach((member: any) => {
            groupData.push([{
                "type": String,
                "value": member.displayname
            },
            {
                "type": String,
                "value": member.username
            }])
        })
        data.push(groupData)
        if (sheetData.includes(group.group)) {
            for (let i = 1; i < 9999; i++) {
                if (!sheetData.includes(group.group + " (" + i + ")")) {
                    sheetData.push(group.group + " (" + i + ")")
                    break
                }
            }
        } else {
            sheetData.push(group.group)
        }
        columeData.push([
            { width: 20 },
            { width: 20 },
            { width: 20 }
        ]);
    }
    const bufferData: any = await writeXlsxFile(data, { buffer: true, sheets: sheetData, columns: columeData })
    return new Response(bufferData, {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="groups.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
    })
}