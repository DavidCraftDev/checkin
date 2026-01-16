"use server";

import { Attendances, StudyTimeData } from "@prisma/client";
import { getSessionUser } from "../auth/cookieManager";
import { getGroupUsers } from "../group";
import { Categories, getUserOverviewData, mergeUserDataPerCW, OverviewUserDataPerCW, SortedData, sortUserOverviewDataIntoCaterogies } from "./user";

type UserAttendances = { [key: string]: Attendances[] };
type UserStudyTimeData = { [key: string]: StudyTimeData[] };

export async function getGroupOverviewData(groupID: string, startCW: number, startYear: number, endCW: number, endYear: number) {
    // Get session user & check if user is allowed to get this data
    const sessionUser = await getSessionUser(1);
    if (sessionUser.permission !== 2 && sessionUser.group.find(group => group === groupID) == undefined) return null;

    // Get all users in group
    const groupUsers = await getGroupUsers(groupID);
    if (!groupUsers) return null;

    // Get all attendances between start and end week (inclusive year) for all users in group
    const userAttendances: UserAttendances = {};
    const userStudyTimeData: UserStudyTimeData = {}
    await Promise.all(groupUsers.map(async user => {
        const userData = await getUserOverviewData(user.id, startCW, startYear, endCW, endYear);
        // If user has no data, set empty array
        if (!userData) {
            userAttendances[user.id] = [];
            userStudyTimeData[user.id] = [];
        } else {
            const { attendances, studyTimeData } = userData;
            userAttendances[user.id] = attendances;
            userStudyTimeData[user.id] = studyTimeData;
        }
    }));

    return { userAttendances, userStudyTimeData };
}

interface OverviewGroupDataPerCW {
    [key: string]: OverviewUserDataPerCW;
}

export async function mergeDataPerCW(userAttendances: UserAttendances, userStudyTimeData: UserStudyTimeData) {
    // Initialize data
    const data: OverviewGroupDataPerCW = {};

    // Get data per user
    await Promise.all(Object.keys(userAttendances).map(async key => {
        const attendances = userAttendances[key];
        const studyTimeData = userStudyTimeData[key];

        // Merge data per CW
        const userData = await mergeUserDataPerCW(attendances, studyTimeData);

        // Add userData to data
        data[key] = userData;
    }));

    return data;
}

export async function sortGroupOverviewDataIntoCaterogies(data: OverviewGroupDataPerCW) {
    // Initialize categories
    const categories: Categories = {
        normal: 0,
        parallel: 0,
        notes: 0,
        absent: 0,
        total: 0
    };
    const categoriesPerUser: { [key: string]: SortedData } = {};

    // Sort data into categories
    await Promise.all(Object.keys(data).map(async key => {
        const userData = data[key];
        const userOverviewCaterogieData = await sortUserOverviewDataIntoCaterogies(userData);
        const userCaterogies = userOverviewCaterogieData.categories;

        // Add data to categories
        categories.normal += userCaterogies.normal;
        categories.parallel += userCaterogies.parallel;
        categories.notes += userCaterogies.notes;
        categories.absent += userCaterogies.absent;
        categories.total += userCaterogies.total;

        // Initialize categories for this user
        categoriesPerUser[key] = userOverviewCaterogieData
    }));

    return { categories, categoriesPerUser };
}

export async function getSortedGroupOverviewData(groupID: string, startCW: number, startYear: number, endCW: number, endYear: number) {
    // Get group overview data
    const overviewData = await getGroupOverviewData(groupID, startCW, startYear, endCW, endYear);
    if (!overviewData) return null;
    const { userAttendances, userStudyTimeData } = overviewData;

    // Merge data by CW
    const mergedData = await mergeDataPerCW(userAttendances, userStudyTimeData);

    // Sort data into categories
    const sortedData = await sortGroupOverviewDataIntoCaterogies(mergedData);

    return { mergedData, sortedData };
}