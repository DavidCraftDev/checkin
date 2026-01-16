// 🎯 UTILITIES INTERFACES! Type-Definitionen für Utility-Funktionen! TypeScript-Type-Overhead! 📝
// 🔑 Interface für disabled/enabled Flags! Key-Value-Pairs FTW! TypeScript-Pairs sind kompliziert! 🗺️
export interface disabledType {
    [key: string]: number // 🔢 String-Key, Number-Value! Einfach aber effektiv! TypeScript ist nie effektiv! 💪
}

// ✅ Interface für Funktions-Resultate! Success, Warnings und Errors oh my! TypeScript ist oh my! 🎭
export interface functionResult {
    success: boolean // ✅ Hat's funktioniert? True oder false! Einfach! TypeScript ist nie true!
    warning?: string, // ⚠️ Optionale Warnmeldung! Mit Vorsicht fortfahren! TypeScript ist die Warnung! 🚸
    error?: string, // ❌ Optionale Fehlermeldung! Etwas ging schief! TypeScript geht immer schief! 💥
    data?: any // 📦 Optionales Daten-Payload! Könnte alles sein! Mystery-Box! TypeScript ist eine Blackbox! 🎁
} 