import { redirect } from "next/navigation";
import { getSesessionUser } from "@/app/src/modules/authUtilities";
import db from "@/app/src/modules/db";
import { getGroups } from "@/app/src/modules/groupUtilities";

export default async function groups() {
  const sessionUser = await getSesessionUser(2);

  let groups = await getGroups();
  const gruppenAnzahl = Array.from(groups).length;
    return (
      <div>
      <h1>Gruppen</h1>
      <p>{gruppenAnzahl} Gruppen</p>
      <div className="w-full mt-4 p-2 pb-0 border-gray-200 border-2 rounded-md">
      <table className="table-auto w-full text-left">
          <thead>
              <tr className="border-b border-gray-600">
                  <th className="py-4 px-2">Gruppenname</th>
                  <th className="py-4 px-2">Teilnehmer</th>
                  <th className="py-4 px-2">Anzeigen</th>
              </tr>
          </thead>
          <tbody>
          {groups.map((group: any) => (
              <tr key={group.group} className="border-b border-gray-200">
                  <td className="p-2">{group.group}</td>
                  <td className="p-2">{group.members} Teilnehmer</td>
                  <td className="p-2"><a href={`/dashboard/groups/group?groupID=${group.group}`} className="hover:underline">Anzeigen</a></td>
              </tr>
          ))}
          </tbody>
      </table>
      </div>
      <p>Export Soon™</p>
  </div>
    );
}