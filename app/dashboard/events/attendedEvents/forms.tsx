"use client";

import { SubmitButton } from "@/app/src/ui/submitButton";
import { useTransition } from "react";
import { toast } from "sonner";
import { handleCreateStudyTimeNote } from "./forms.actions";
import { useRouter } from "next/navigation";

export function CreateStudyTimeNote(props: { userID: string, cw: number, year: number }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    async function action() {
        startTransition(async () => {
            const result = await handleCreateStudyTimeNote(props.userID, props.cw, props.year);
            if(result.success) {
                toast.success("Notiz erstellt");
                router.refresh();
            } else {
                toast.error(result.error || "Fehler beim Erstellen der Notiz");
            }
        });
    }

    return (
        <form action={action}>
            <SubmitButton text="Notiz erstellen" className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 w-auto inline-block" />
        </form>
    )
}
