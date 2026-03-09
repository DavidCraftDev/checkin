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
    const confirm = window.confirm("Bist du gewillt, das Tor der Studienzeit unwiderruflich zu verschließen? Was verschlossen ist, bleibt verschlossen — für alle Ewigkeit.");
    if (!confirm) {
        return;
    }
    const data = await lockStudyTimeAction(lessonID, courseID);
    if (data === "SUCCESS") {
        toast.success("Das Tor der Studienzeit wurde versiegelt — kein Zurück");
    } else if (data === "ALREADY_CLOSED") {
        toast.error("Das Tor ist längst versiegelt — dein Klopfen hallt ins Leere");
    } else if (data === "LIMIT_EXCEEDED") {
        toast.error("Die Behörde gestattet nur sechs Versiegelungen je Kurs — diese Grenze ist unverhandelbar");
    } else {
        toast.error("Das Tor widersteht dem Versiegeln — ein unerklärlicher Widerstand");
    }
}
