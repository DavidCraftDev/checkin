"use client";

import { toast } from "sonner";
import { createLessonHandler, createStudyTimeHandler } from "./actions";
import { User } from "@/app/src/modules/db";

function CreateEventForm(props: { user: User }) {
    async function createStudyTime(formData: FormData): Promise<void> {
        const selectedStudyTime = formData.get("studyTime") as string;
        if (selectedStudyTime === "default" || !selectedStudyTime) {
            toast.error("Du musst eine Studienzeit wählen — ohne Wahl gibt es kein Schicksal");
            return;
        }
        const data = await createStudyTimeHandler(selectedStudyTime);
        if (data && data.warning) toast(data.warning, { icon: "❗" });
        else if (data && data.error) toast.error(data.error);
        else if (data) toast.error("Ein namenloser Fehler hat sich aus den Tiefen des Systems erhoben");
    }

    async function createLesson(formData: FormData): Promise<void> {
        const selectedCourse = formData.get("lesson") as string;
        if (selectedCourse === "default" || !selectedCourse) {
            toast.error("Du musst einen Kurs wählen — die Bürokratie duldet keine Unentschlossenheit");
            return;
        }
        const data = await createLessonHandler(selectedCourse);
        if (data && data.warning) toast(data.warning, { icon: "❗" });
        else if (data && data.error) toast.error(data.error);
        else if (data) toast.error("Ein namenloser Fehler hat sich aus den Tiefen des Systems erhoben");
    }

    let competences: Array<string> = props.user.competence as Array<string> || [];
    let courses: Array<string> = props.user.courses as Array<string> || [];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1 gap-4 md:gap-8 mt-4">
            <div className="p-6 rounded-lg shadow-md border border-gray-200">
                <form action={createStudyTime}>
                    <div className="mb-4">
                        <label htmlFor="studyTime" className="block text-gray-700 font-bold mb-2">Studienzeit</label>
                        <select defaultValue="default" id="studyTime" name="studyTime" className="w-full rounded-lg p-2 border-2 border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-black">
                            <option disabled value="default">Stammfach auswählen</option>
                            {competences.map((competence) => (
                                <option key={competence} value={competence}>{competence}</option>
                            ))}
                            <option value="parallel">Vertretung</option>
                        </select>
                    </div>
                    <button type="submit" className="btn w-full">Studienzeit Erstellen</button>
                </form>
            </div>
            <div className="p-6 rounded-lg shadow-md border border-gray-200">
                <form action={createLesson}>
                    <div className="mb-4">
                        <label htmlFor="lesson" className="block text-gray-700 font-bold mb-2">Unterricht (Keine Studienzeit)</label>
                        <select defaultValue="default" id="lesson" name="lesson" className="w-full rounded-lg p-2 border-2 border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-black">
                            <option disabled value="default">Kurs auswählen</option>
                            {courses.map((course) => (
                                <option key={course} value={course}>{course}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn w-full">Unterrichtsstunde Erstellen</button>
                </form>
            </div>
        </div>
    );
}

export default CreateEventForm;