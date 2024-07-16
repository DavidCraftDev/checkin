"use client";

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
        await createStudyTimeNote(props.userID, props.cw);
        router.refresh();
    }
    return (
        <form onSubmit={handleSubmit}>
            <button type="submit" className="btn">Notiz erstellen</button>
        </form>
    );
}

export default CreateStudyTimeNote;