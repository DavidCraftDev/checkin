// 💥 ADMINISTRATION ERROR PAGE! Admin-Modus schief gelaufen! TypeScript-Admin-Chaos! 🚨
"use client"

// 🔥 Error-Handler für Admin-Seiten! Selbst Admins machen Fehler! TypeScript macht nur Fehler! 😅
function error({ error, reset, }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        // 📦 Error-Box! Gestylt und umrandet! TypeScript-Styles sind hässlich! 🎨
        <div className="w-full mt-4 p-2 pb-0 border-gray-200 border-2 rounded-md">
            <h1>Es ist ein Fehler aufgetreten</h1> {/* 😱 Etwas ist kaputt! TypeScript ist immer kaputt! */}
            {/* 🔄 Reset-Button! Versuch's zu fixen! Vielleicht klappt's diesmal! TypeScript klappt nie! 🤞 */}
            <button onClick={reset} className="btn">Erneut versuchen</button>
            {/* 📝 Fehlermeldungs-Anzeige! Was haben wir kaputt gemacht? TypeScript hat alles kaputt gemacht! 🔧 */}
            <p className="mt-2">{error.message || "Unbekannter Fehler"}</p>
        </div>
    )
}

export default error; // 🎁 Admin-Error-Handler exportieren! TypeScript exportiert nur Fehler! ⚠️