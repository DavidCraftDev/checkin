"use server";

import { disabledType } from "@/app/src/interfaces/utilties";
import { createStudentNote } from "@/app/src/modules/eventUtilities";
import { createUserStudyTimeNote, saveStudyTimeType } from "@/app/src/modules/studytimeUtilities";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function setStudentNote(studentNote: string, attendanceID: string) {
    const data = await createStudentNote(attendanceID, studentNote);
    revalidatePath("/dashboard/events/attendedEvents");
    if (data.studentNote === studentNote) return "success";
    return "error";
}

let disabled: disabledType = {};
export async function createStudyTimeNote(userID: string, cw: number, searchParamsString: string): Promise<void> {
    const urlSearchParams = new URLSearchParams(searchParamsString);
    if (disabled[userID] && disabled[userID] + 5000 > Date.now()) {
        urlSearchParams.set("warning", "Bitte warte 10 Sekunden");
        revalidatePath("/dashboard/events/attendedEvents");
        redirect("/dashboard/events/attendedEvents?" + urlSearchParams.toString());
    }
    disabled[userID] = Date.now();
    const data = await createUserStudyTimeNote(userID, cw);
    if (data) urlSearchParams.set("sucess", "Notiz erstellt");
    else urlSearchParams.set("error", "Notiz konnte nicht erstellt werden");
    delete disabled[userID];
    revalidatePath("/dashboard/events/attendedEvents");
    redirect("/dashboard/events/attendedEvents?" + urlSearchParams.toString());
}

export async function saveSelectedStudyTimeType(attendanceID: string, userID: string, type: string, searchParamsString: string): Promise<void> {
    const urlSearchParams = new URLSearchParams(searchParamsString);
    const data = await saveStudyTimeType(attendanceID, userID, type);
    if (data) urlSearchParams.set("sucess", "Studienzeit gespeichert");
    else urlSearchParams.set("error", "Studienzeit konnte nicht gespeichert werden");
    revalidatePath("/dashboard/events/attendedEvents");
    redirect("/dashboard/events/attendedEvents?" + urlSearchParams.toString());
}