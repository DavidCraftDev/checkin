import { getSesessionUser } from "@/app/src/modules/authUtilities"
import db from "@/app/src/modules/db";

export async function GET(request: Request) {
    const user = await getSesessionUser(2);
    const users = await db.user.findMany()
    users.forEach((user: any) => {
        user.password = undefined
        user.loginVersion = undefined
    })
    user.password = undefined
    user.loginVersion = undefined
    const data = new Array()
    data.push({
        meta: {
            type: "user",
            exportedEntries: users.length,
            requestedBy: user.id,
            time: new Date()
        }
    })
    data.push(users, user)
   
    return Response.json({ data })
  }