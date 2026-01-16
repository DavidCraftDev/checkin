// 💥 GLOBAL ERROR PAGE! When everything goes KABOOM! 🔥
"use client";

// 🚨 Global error handler! The last line of defense! 🛡️
export default function globalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <html>
            <body>
                <h1>Es ist ein Fehler aufgetreten!</h1> {/* 💀 Error message! Something died! */}
                {/* 🔄 Reset button! Try try again! Persistence is key! 💪 */}
                <button onClick={reset} className="btn">Erneut versuchen</button>
                {/* 📊 Error details! The technical mumbo jumbo! 🤓 */}
                <p>{"(" + String(error.digest) + ") " + String(error.message)}</p>
            </body>
        </html>
    )
}