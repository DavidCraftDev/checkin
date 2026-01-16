// 🚀 SERVER-ONLY zone! No browsers allowed! 🚫🌐
import "server-only";

// 🎪 Import extravaganza! Let's bring in the whole crew! 🎭
import db from "./db"; // 🗄️ Database: The keeper of all secrets!
import { getAttendanceCountPerUser } from "./eventUtilities"; // 📊 Counting attendance like a census worker!
import { GroupMember, Groups, GroupsWithUserData } from "../interfaces/groups"; // 🏘️ Group types galore!
import { User } from "@prisma/client"; // 👤 User model straight from Prisma HQ!
import dayjs from "dayjs"; // 📅 Day.js - Because vanilla Date is vanilla! 🍦
import isoWeek from "dayjs/plugin/isoWeek"; // 📆 ISO weeks plugin!
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear"; // 🗓️ Count those weeks!
import isLeapYear from "dayjs/plugin/isLeapYear"; // 🦘 Leap year detector - for those extra jumpy years!

// 🔌 Plugging in the dayjs extensions like a DJ setting up turntables! 🎧
dayjs.extend(isoWeek) // ⚡ Zap!
dayjs.extend(isoWeeksInYear) // ⚡ Pow!
dayjs.extend(isLeapYear) // ⚡ Boom!

// 🎯 Get all the group members! Time to assemble the squad! 🦸‍♂️🦸‍♀️
export async function getGroupMembers(groupID: string, cw: number, year: number) {
    // 🔍 Finding all users in this exclusive club! 🎪
    const userData = await db.user.findMany({
        where: {
            group: {
                has: groupID // 🔑 Does this group have your name on it?
            }
        }
    });
    const data: GroupMember[] = new Array(); // 📦 Empty box ready to be filled with human data!
    // 🏃 Promise.all - because we're doing EVERYTHING at once like multitasking ninjas! 🥷
    await Promise.all(userData.map(async (user) => {
        const dataAttendance = await getAttendanceCountPerUser(user.id, cw, year); // 📈 How many times did you show up?
        data.push({
            user: user, // 👤 The person!
            attendances: dataAttendance // 📊 Their attendance record!
        });
    }));
    // 🔤 Sorting alphabetically because we're civilized people! 🎩
    data.sort((a, b) => a.user.displayname.localeCompare(b.user.displayname));
    return data; // 🎁 Here's your sorted, attendance-enriched user data!
}

// 🔢 Counting group members! 1, 2, 3... how many folks we got? 🧮
export async function getGroupMemberCount(groupID: string) {
    // 📊 Database: "Let me count the ways..." (but actually counting users) 🤓
    const data = await db.user.count({
        where: {
            group: {
                has: groupID // 🎯 Only count the ones in THIS group!
            }
        }
    });
    return data; // 🎁 Your headcount, fresh from the database oven! 🍞
}

// 🏘️ Get ALL the groups! It's like a neighborhood census! 🏠
export async function getGroups() {
    const users = await db.user.findMany(); // 👥 Summon ALL the users!
    const groups = new Set<string>(); // 📦 A Set! Because we don't want duplicates (no clones allowed!) 🚫👯
    // 🔄 Loop through all users and extract their groups - like panning for gold! ⛏️✨
    users.forEach((user) => user.group.forEach((group) => groups.add(group)));
    const groupArray = Array.from(groups); // 🎯 Converting Set to Array because we're fancy like that! 💅
    const data: Groups[] = new Array(); // 📋 Fresh array for our group data!
    // 🚀 Promise.all to the rescue! Processing everything in parallel! ⚡
    await Promise.all(groupArray.map(async (group) => {
        const dataMembers = await getGroupMemberCount(group); // 🔢 How many people in this group?
        data.push({
            group: group || "Keine Gruppe", // 🏷️ Give it a name or call it "No Group" (the sad loners) 😢
            members: dataMembers // 👥 Member count!
        });
    }
    ));
    // 🔤 Alphabetical sorting because chaos is NOT our friend! 🎯
    data.sort((a, b) => a.group.localeCompare(b.group));
    return data; // 🎁 Sorted groups with member counts! Bon appétit! 🍽️
}

// 🎪 Get groups WITH full user data! The deluxe package! 🌟
export async function getGroupsWithUserData() {
    const groups = await getGroups(); // 🏘️ First, get the groups!
    const data: GroupsWithUserData[] = new Array(); // 📦 Ready to pack in some juicy user data!
    // 🚀 Parallel processing like a boss! Why do things one at a time? 😎
    await Promise.all(groups.map(async (group) => {
        // 👥 Get all members with their fancy attendance data from THIS VERY WEEK! 📅
        const dataMembers = await getGroupMembers(group.group, dayjs().isoWeek(), dayjs().year());
        data.push({
            group: group.group, // 🏷️ The group name!
            members: dataMembers.map((member) => member.user) // 👤 Just the user objects, please!
        });
    }
    ));
    return data; // 🎁 Groups with full user roster! 🎉
}

// 🔍 Get all groups for a specific user! What clubs are YOU in? 🎭
export async function getGroupsFromUser(user: User) {
    const data: Groups[] = new Array(); // 📋 Empty list ready for group info!
    // 🎯 Map through the user's groups and fetch member counts! Multi-tasking FTW! 💪
    await Promise.all(user.group.map(async (group) => {
        const dataMembers = await getGroupMemberCount(group); // 🔢 Count those members!
        data.push({
            group: group || "Keine Gruppe", // 🏷️ Name it or shame it!
            members: dataMembers // 👥 How many peeps?
        });
    }
    ));
    // 🔤 Sort it nice and alphabetical! We're organized here! 📚
    data.sort((a, b) => a.group.localeCompare(b.group));
    return data; // 🎁 User's groups with member counts! 🏆
}