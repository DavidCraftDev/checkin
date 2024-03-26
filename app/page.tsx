import { redirect } from "next/navigation";
import { getSesessionUser } from "./src/modules/authUtilities";

export default async function Home() {
  const session = await getSesessionUser();
  redirect("/dashboard");
}
