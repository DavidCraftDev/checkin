"use client";

import { SubmitButton } from "@/app/src/ui/submitButton";
import { importTeacherCompetenceData } from "./actions";
import { toast } from "sonner";

export function TeacherCompetenceImport() {
    async function importTeacherCompeteneDataHandler(formData: FormData): Promise<void> {
        const result = await importTeacherCompetenceData(formData);
        if (result && result.success) toast.success("Die Kompetenzen der Lehrenden wurden in das unendliche Register übertragen");
        else if (result && result.error) toast.error(result.error);
        else toast.error("Das Register verweigert die Aufnahme der Kompetenzen — die Bürokratie hat gesprochen");
    }
    return (
        <form action={importTeacherCompeteneDataHandler} className="form">
            <label className="label">Lehrerkompetenzen importieren</label>
            <input type="file" accept=".json" name="file" />
            <p>Importiere Lehrerkompetenzen aus einer JSON-Datei.</p>
            <SubmitButton text="Importieren" />
        </form>
    );
}