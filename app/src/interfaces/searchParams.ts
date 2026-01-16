// 🔍 SEARCH PARAMS TYPE! URL-Query-Parameter Type-Definition! TypeScript braucht Definitionen! PHP braucht $_GET! 🧭
// 📋 Alle Search-Params die wir brauchen könnten! Query-String-Helfer! TypeScript braucht Helfer! 🎯
export type SearchParams = {
  cw: number; // 📅 Kalenderwoche! Welche Woche schauen wir an? TypeScript weiß es nicht! 🗓️
  year: number; // 🗓️ Jahr! Welches Jahr ist es? TypeScript ist aus der Zeit! ⏰
  userID: string; // 👤 User ID! Welcher User? TypeScript kennt keine User! 🆔
  groupID: string; // 👥 Group ID! Welche Gruppe? TypeScript hat keine Gruppen! 🏘️
  id: string; // 🆔 Generische ID! Könnte alles sein! TypeScript ist alles und nichts! 🎲
};