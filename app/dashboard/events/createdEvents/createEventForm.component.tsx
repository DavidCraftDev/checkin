"use client";

import { User } from "@prisma/client";
import submitHandlerStudyTime from "./actions";
import { FormEvent } from "react";
import toast from "react-hot-toast";

function CreateEventForm(props: { user: User }) {
    async function createStudyTime(formData: FormData): Promise<void> {
        const selectedStudyTime = formData.get("studyTime") as string;
        if (selectedStudyTime === "default" || !selectedStudyTime) {
            toast.error("Bitte wähle eine Studienzeit aus");
            return;
        }
        const data = await submitHandlerStudyTime(selectedStudyTime);
        if (data && data.warning) toast(data.warning, { icon: "❗" });
        else if (data && data.error) toast.error(data.error);
        else if(!data || !data.success) toast.error("Ein unbekannter Fehler ist aufgetreten");
    }

    let competences: Array<string> = props.user.competence as Array<string> || [];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1 gap-4 md:gap-8 mt-4">
            <div className="p-6 rounded-lg shadow-md border border-gray-200">
                <form action={createStudyTime}>
                    <div className="mb-4">
                        <label htmlFor="studyTime" className="block text-gray-700 font-bold mb-2">Studienzeit</label>
                        <select defaultValue="default" id="studyTime" name="studyTime" className="w-full rounded-lg p-2 border-2 focus:outline-none focus:ring-2 focus:ring-black">
                            <option disabled value="default">Studienzeit wählen</option>
                            {competences.map((competence) => (
                                <option key={competence} value={competence}>{competence}</option>
                            ))}
                            <option value="parallel">Vertretung</option>
                        </select>
                    </div>
                    <button type="submit" className="btn w-full">Studienzeit Erstellen</button>
                </form>
            </div>
        </div>
    );
}

export default CreateEventForm;