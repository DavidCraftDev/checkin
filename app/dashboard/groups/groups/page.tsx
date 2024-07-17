import { getSessionUser } from "@/app/src/modules/authUtilities";
import { getGroups } from "@/app/src/modules/groupUtilities";
import GroupsTable from "./groupsTable.component";

interface groupData {
  group: string,
  members: number
}

export default async function groups() {
  await getSessionUser(2);

  let groups: groupData[] = await getGroups();
  const groupCount = groups.length;
  return (
    <div>
      <h1>Gruppen</h1>
      <p>{groupCount} {groupCount == 1 ? "Gruppe" : "Gruppen"}</p>
      <GroupsTable groups={groups} />
      <p>Exportieren als:
        <a href="/export/groups/groups/json" download="groups.json" className="hover:underline mx-1">JSON</a>
        <a href="/export/groups/groups/xlsx" download="groups.xlsx" className="hover:underline mx-1">XLSX</a>
      </p>
    </div>
  );
}