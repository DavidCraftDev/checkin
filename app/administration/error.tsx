// 💥 ADMINISTRATION ERROR PAGE! Admin mode gone wrong! 🚨
"use client"

// 🔥 Error handler for admin pages! Even admins make mistakes! 😅
function error({ error, reset, }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        // 📦 Error box! Styled and bordered! 🎨
        <div className="w-full mt-4 p-2 pb-0 border-gray-200 border-2 rounded-md">
            <h1>Es ist ein Fehler aufgetreten</h1> {/* 😱 Something broke! */}
            {/* 🔄 Reset button! Try fixing it! Maybe it'll work this time! 🤞 */}
            <button onClick={reset} className="btn">Erneut versuchen</button>
            {/* 📝 Error message display! What did we break? 🔧 */}
            <p className="mt-2">{error.message || "Unbekannter Fehler"}</p>
        </div>
    )
}

export default error; // 🎁 Export the admin error handler! ⚠️