import { getSessionUser } from "@/app/src/modules/authUtilities";
import { getGroupsFromUser } from "@/app/src/modules/groupUtilities";
import GroupsTable from "./myGroupsTable.component";

export default async function groups() {
  const user = await getSessionUser(1);

  let groups = await getGroupsFromUser(user);
  const groupCount = groups.length;
  return (
    <div>
      <h1>Meine Gruppen</h1>
      <p>{groupCount} {groupCount == 1 ? "Gruppe" : "Gruppen"}</p>
      <GroupsTable groups={groups} />
    </div>
  );
}