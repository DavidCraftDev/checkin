import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { getCoursesForSessionUser } from "@/app/src/modules/courses";
import { Metadata } from "next";
import CoursesTable from "./coursesTable.component";
import { Permission } from "@/app/src/constants/permissions";

async function CoursesPage() {
    const [user, courses] = await Promise.all([getSessionUser(Permission.TEACHER), getCoursesForSessionUser()]);
    return (
        <>
            <h1>Meine Kurse</h1>
            <p>{user.courses.length} {user.courses.length !== 1 ? "Kurse" : "Kurs"}</p>
            <CoursesTable courses={courses} />
        </>
    );
}

export default CoursesPage;

export const metadata: Metadata = {
    title: "Meine Kurse - CheckIN-System",
    description: "Die Kurse des Lehrers im CheckIN-System"
}  