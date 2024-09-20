"use client";

import toast from "react-hot-toast";
import createStudyTimeNote from "./createStudyTimeNoteHandler";
import { useRouter } from 'next/navigation';

interface CreateStudyTimeNoteProps {
    userID: string;
    cw: number;
}

function CreateStudyTimeNote(props: CreateStudyTimeNoteProps) {
    const router = useRouter();
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const result = await createStudyTimeNote(props.userID, props.cw);
        if(result === 1) toast.success("Notiz erfolgreich erstellt");
        else if(result === 2) toast("Bitte warte 10 Sekunden", { icon: "❗" });
        else toast.error("Fehler beim Erstellen der Notiz");
        router.refresh();
    }
    return (
        <form onSubmit={handleSubmit}>
            <button type="submit" className="btn">Notiz erstellen</button>
        </form>
    );
}

export default CreateStudyTimeNote;