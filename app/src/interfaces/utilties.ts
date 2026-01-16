// 🎯 UTILITIES INTERFACES! Type definitions for utility functions! 📝
// 🔑 Interface for disabled/enabled flags! Key-value pairs FTW! 🗺️
export interface disabledType {
    [key: string]: number // 🔢 String key, number value! Simple but effective! 💪
}

// ✅ Interface for function results! Success, warnings, and errors oh my! 🎭
export interface functionResult {
    success: boolean // ✅ Did it work? True or false! Simple! 
    warning?: string, // ⚠️ Optional warning message! Proceed with caution! 🚸
    error?: string, // ❌ Optional error message! Something went wrong! 💥
    data?: any // 📦 Optional data payload! Could be anything! Mystery box! 🎁
} 