import { redirect } from "next/navigation";
import { getSesession } from "./src/modules/authUtilities";

export default async function Home() {
  const session = await getSesession();
  redirect("/dashboard");
}
