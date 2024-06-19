"use client";

import createNote from "./createStudyTimeNoteHandler";
import { useRouter } from 'next/navigation';

function CreateStudyTimeNote(props: any) {
    const router = useRouter();
    return (
        <form action={() => { createNote(props.userID, props.cw), router.refresh() }}>
            <button type="submit" className="btn">Notiz erstellen</button>
        </form>
    )
}

export default CreateStudyTimeNote;