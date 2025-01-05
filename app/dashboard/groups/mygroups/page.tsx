import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { getGroupsFromUser } from "@/app/src/modules/groupUtilities";
import GroupsTable from "./myGroupsTable.component";
import { redirect } from "next/navigation";

async function GroupsPage() {
  const user = await getSessionUser(1);

  let groups = await getGroupsFromUser(user);
  const groupCount = groups.length;
  if(groupCount === 0) redirect("/dashboard");
  else if(groupCount === 1) redirect("/dashboard/groups/group");
  return (
    <div>
      <h1>Meine Gruppen</h1>
      <p>{groupCount} Gruppen</p>
      <GroupsTable groups={groups} />
    </div>
  );
}

export default GroupsPage;