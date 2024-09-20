"use client"

import { Attendances, User } from "@prisma/client";
import removeUserHandler from "./removeUserHandler";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import toast from "react-hot-toast";

dayjs.extend(isoWeek)

interface RemoveUserProps {
    user: User;
    removeUser: User;
    attendance: Attendances;
}

function RemoveUser(props: RemoveUserProps) {
    const router = useRouter();
    async function removeUser() {
        if(props.attendance.cw !== dayjs().isoWeek() || dayjs(props.attendance.created_at).year() !== dayjs().year()) return router.refresh();
        if(!confirm("Möchtest du den Nutzer wirklich löschen?")) return;
        const data = await removeUserHandler(props.attendance, props.user, props.removeUser);
        if (data.id === props.attendance.id) toast.success("Nutzer erfolgreich entfernt");
        else toast.error("Fehler beim entfernen des Nutzers");
        router.refresh();
    }
    return (
        <td>
            <button onClick={() => removeUser()} className="btn bg-red-700 hover:bg-red-900">Nutzer entfernen</button>
        </td>
    );
}

export default RemoveUser;