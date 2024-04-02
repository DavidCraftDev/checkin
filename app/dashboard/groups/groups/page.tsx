import { redirect } from "next/navigation";
import { getSesessionUser } from "@/app/src/modules/authUtilities";
import db from "@/app/src/modules/db";
import { getGroups } from "@/app/src/modules/groupUtilities";
import GroupsTable from "./groupsTable.component";

export default async function groups() {
  const sessionUser = await getSesessionUser(2);

  let groups = await getGroups();
  const gruppenAnzahl = Array.from(groups).length;
    return (
      <div>
      <h1>Gruppen</h1>
      <p>{gruppenAnzahl} Gruppen</p>
      <GroupsTable groups={groups} />
      <a href={"/export/groups/groups/json"} download={"groups" + ".json"} className="hover:underline">Exportieren</a>
  </div>
    );
}