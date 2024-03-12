import db from "@/app/src/modules/db"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/src/modules/auth";
import { redirect } from "next/navigation";

export default async function User() {
    const session = await getServerSession(authOptions);
    if (!session) {
      redirect("/api/auth/signin");
    }
    	const group: string = session.user.group;
    const user = await db.user.findMany({
      where: {
        group: group
      }
    });
    return (
        <div className="text-black">
            <p>{"Meine Gruppe " + group}</p>
            {user.map((user) => (
        <div key={user.id} className="bg-white mb-3 px-5 py-3 rounded-md">
          {user.displayname}
        </div>
      ))}
        </div>
    );
}