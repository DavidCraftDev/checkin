import db from "@/app/src/modules/db"

export default async function User() {
    const user = await db.user.findMany();
    return (
        <div className="text-black">
            <p>Dashboard</p>
            {user.map((user) => (
        <div key={user.id} className="bg-white mb-3 px-5 py-3 rounded-md">
          {user.displayname}
        </div>
      ))}
        </div>
    );
}