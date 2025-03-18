import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { getStudentsPerCourse } from "@/app/src/modules/courses";
import { checkDate, getCurrentWeek } from "@/app/src/modules/date";
import CalendarWeek from "@/app/src/ui/calendarweek";
import { Metadata } from "next";
import { redirect } from "next/navigation";

async function CoursePage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    await getSessionUser(1);
    const courseID = decodeURIComponent((await params).slug);
    const searchParamsData = await searchParams;
    const calendarWeek: number = Number(searchParamsData.cw) || getCurrentWeek();
    const year: number = Number(searchParamsData.year) || new Date().getFullYear();
    if(!checkDate(year, calendarWeek)) redirect("/dashboard/courses/" + courseID);
    const data = await getStudentsPerCourse(courseID);
    return (
        <>
            <div>
                <h1>Kurs {courseID}</h1>
                <p>{data.length} Schüler</p>
                <CalendarWeek />
                <p>Anwesenheit kontrollieren</p>
            </div>
            <p>Anwenheiten</p>
            <p>Studienzeiten</p>
        </>
    )
}

export default CoursePage;

export const metadata: Metadata = {
    title: "Kurs - CheckIN-System",
    description: "Ein Kurs im CheckIN-System"
};