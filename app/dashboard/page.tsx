import { getServerSession } from "next-auth";
import { authOptions } from "@/app/src/modules/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/api/auth/signin");
    }
    return (
        <div className="text-black">
            <h1>Dashboard</h1>
            <p>Hallo { session.user.name }</p>
        </div>
    );
}