import { getSessionUser } from "@/lib/auth/cookieManager";
import { getGroupsFromUser } from "@/lib/groups";
import GroupsTable from "./myGroupsTable.component";
import { redirect } from "next/navigation";

async function GroupsPage() {
  const user = await getSessionUser(1);

  const groups = await getGroupsFromUser(user);
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

export const metadata = {
  title: "Meine Gruppen - CheckIN-System",
  description: "Hier findest du alle Gruppen, in denen du Mitglied bist."
};