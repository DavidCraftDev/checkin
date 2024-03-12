import { getServerSession } from "next-auth";
import { authOptions } from "@/app/src/modules/auth";

export default async function Dashboard() {
    const session = await getServerSession(authOptions);
    return (
        <div className="text-black">
            <p>Dashboard</p>
            <p>Hallo { session?.user?.name }</p>
        </div>
    );
}