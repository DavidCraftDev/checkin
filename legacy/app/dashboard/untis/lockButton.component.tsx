"use client";

import { toast } from "sonner";
import { lockStudyTimeAction } from "./lockButton.action";

export function LockButtonComponent(props: { lessonID: string; courseID: string }) {
    const { lessonID, courseID } = props;
    return (
        <button
            type="button"
            className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-800 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-200"
            aria-label="Studienzeit schließen"
            title="Studienzeit schließen"
            onClick={() => {
                closeStudyTimeAction(lessonID, courseID);
            }}
        >
            🔒<span className="hidden 2xl:block"> Schließen</span>
        </button>
    );
}

async function closeStudyTimeAction(lessonID: string, courseID: string) {
    const confirm = window.confirm("Möchtest du die Studienzeit wirklich schließen? Dies kann nicht rückgängig gemacht werden.");
    if (!confirm) {
        return;
    }
    const data = await lockStudyTimeAction(lessonID, courseID);
    if (data === "SUCCESS") {
        toast.success("Studienzeit erfolgreich geschlossen");
    } else if (data === "ALREADY_CLOSED") {
        toast.error("Die Studienzeit ist bereits geschlossen");
    } else if (data === "LIMIT_EXCEEDED") {
        toast.error("Das Limit von 6 geschlossenen Studienzeiten pro Kurs wurde erreicht");
    } else {
        toast.error("Fehler beim Schließen der Studienzeit");
    }
}
