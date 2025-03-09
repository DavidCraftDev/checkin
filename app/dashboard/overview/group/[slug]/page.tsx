import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import CalendarWeekRange from "@/app/src/ui/calendarweekRange";
import { notFound, redirect } from "next/navigation";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import { OverviewChart } from "../../forms";
import { getGroupUsers } from "@/app/src/modules/group";
import { getSortedGroupOverviewData } from "@/app/src/modules/overview/group";
import GroupOverviewTable from "./groupOverviewTable.component";
import { Metadata } from "next";

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

async function GroupOverviewPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    // Get session user 
    const sessionUser = await getSessionUser(1);
    const groupID = decodeURIComponent((await params).slug);
    if (!groupID) notFound();

    // Check if user is allowed to view this page
    if (sessionUser.permission !== 2 && sessionUser.group.find(group => group === groupID) == undefined) redirect("/dashboard/");

    // Get all users in group
    const users = await getGroupUsers(groupID);
    if (!users) notFound();

    // Decode search params
    const searchParamsData = await searchParams;
    const startCW = Number(searchParamsData.startCW) || dayjs().isoWeek();
    const startYear = Number(searchParamsData.startYear) || dayjs().year();
    const endCW = Number(searchParamsData.endCW) || dayjs().isoWeek();
    const endYear = Number(searchParamsData.endYear) || dayjs().year();

    // Check that start week is not after end week
    if (startYear > endYear || (startYear === endYear && startCW > endCW)) redirect(`/dashboard/overview/group/${groupID}/`);

    // Get group overview data
    const overviewData = await getSortedGroupOverviewData(groupID, startCW, startYear, endCW, endYear);
    if (!overviewData) notFound();
    const { categories, categoriesPerUser } = overviewData.sortedData;
    if (!categories) notFound();
    if (!categoriesPerUser) notFound();
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <h1>Übersicht {groupID}</h1>
                    <p>{users.length} Mitglieder</p>
                </div>
                <CalendarWeekRange />
            </div>
            <OverviewChart categories={categories} />
            <GroupOverviewTable data={categoriesPerUser} users={users} startCW={startCW} startYear={startYear} endCW={endCW} endYear={endYear} />
            <p>Exportieren als:
                <a href={`/api/v1/overview?groupID=${groupID}&startCW=${startCW}&startYear${startYear}&endCW=${endCW}&endYear=${endYear}`} download={`overview_${groupID}_${startCW + startYear}_${endCW + endYear}.json`} className="hover:underline mx-1">JSON</a>
                <a href={`/export/overview/group/xlsx?groupID=${groupID}&startCW=${startCW}&startYear${startYear}&endCW=${endCW}&endYear=${endYear}`} className="hover:underline mx-1">XLSX</a>
            </p>

        </>
    );
}

export default GroupOverviewPage;

export const metadata: Metadata = {
    title: "Gruppenübersicht - CheckIN-System",
    description: "Übersicht über die Anwesenheit und Lernzeiten aller Mitglieder einer Gruppe",
}