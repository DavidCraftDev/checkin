import { getSesessionUser } from "@/app/src/modules/authUtilities"
import db from "@/app/src/modules/db";
import writeXlsxFile from "write-excel-file/node";

export async function GET(request: Request) {
    const user = await getSesessionUser(2);
    const users = await db.user.findMany()
    users.forEach((user: any) => {
        user.password = undefined
        user.loginVersion = undefined
    })
    user.password = undefined
    user.loginVersion = undefined
    const dataOLD = new Array()
    dataOLD.push({
        meta: {
            type: "user",
            exportedEntries: users.length,
            requestedBy: user.id,
            time: new Date()
        }
    })
    const data = new Array()
    data.push([{
        "type": String,
        "value": "Alle Nutzer",
        "fontWeight": "bold"
    }])
    data.push([{
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
    data.push([{
        "type": Date,
        "value": new Date(),
        "format": "DD.MM.YYYY HH:mm"
    },
    { 
        "type": Number,
        "value": users.length
    },
    {
        "type": String,
        "value": user.displayname
    }])
    data.push([{}])
    data.push([{
        "type": String,
        "value": "Name",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Nutzername",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Rechte",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Gruppe",
        "fontWeight": "bold"
    }])
    users.forEach((userData: any) => {
        data.push([{
            "type": String,
            "value": userData.displayname,
            "wrap": true
        },
        {
            "type": String,
            "value": userData.username,
        },
        {
            "type": Number,
            "value": userData.permission,
        },
        {
            "type": String,
            "value": userData.group,
            "wrap": true
        }])
    })
    const columns = [
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 }
      ];
    const bufferData: any = await writeXlsxFile(data, { buffer: true, sheet: "Nutzer", columns: columns } )
    return new Response(bufferData, {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="users.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
  })
  }