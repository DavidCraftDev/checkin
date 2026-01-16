// 🔍 SEARCH PARAMS TYPE! URL query parameters type definition! 🧭
// 📋 All the search params we might need! Query string helpers! 🎯
export type SearchParams = {
  cw: number; // 📅 Calendar week! Which week are we looking at? 🗓️
  year: number; // 🗓️ Year! What year is it? ⏰
  userID: string; // 👤 User ID! Which user? 🆔
  groupID: string; // 👥 Group ID! Which group? 🏘️
  id: string; // 🆔 Generic ID! Could be anything! 🎲
};