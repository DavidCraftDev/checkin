import db from "@/app/src/modules/db"

export default async function User() {
    const user = await db.user.findMany();
    let groups = new Set<string>();
    user.forEach((user) => {
        groups.add(String(user.group));
    });
    return (
        <div className="text-black">
            <p>Gruppen</p>
            {Array.from(groups).map((group) => (
        <div key={group} className="bg-white mb-3 px-5 py-3 rounded-md">
          {group}
        </div>
      ))}
        </div>
    );
}