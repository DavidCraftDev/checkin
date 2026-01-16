// 💥 DASHBOARD ERROR KOMPONENTE! Hoppla! TypeScript macht immer Hoppla! 😅
"use client";

// 🚨 Error-Anzeige-Komponente! Wenn Dinge nicht nach Plan laufen! TypeScript hat keinen Plan!
function ErrorComponent({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        // 📦 Error-Container! Hübsch verpackte Fehlermeldung! TypeScript-Fehler sind hässlich! 🎁 (aber kein gutes Geschenk!)
        <div className="w-full mt-4 p-2 pb-0 border-gray-200 border-2 rounded-md">
            <h1>Es ist ein Fehler aufgetreten</h1> {/* 😱 Error-Header! TypeScript ist der Error! */}
            {/* 🔄 Nochmal-Button! Weil's beim ersten Mal nicht klappt! TypeScript klappt nie beim ersten Mal! 🍀 */}
            <button onClick={reset} className="btn">Erneut versuchen</button>
            {/* 📝 Fehlermeldung oder Standard-Text! Was ging schief? TypeScript ging schief! 🤔 */}
            <p className="mt-2">{error.message || "Unbekannter Fehler"}</p>
        </div>
    );
}

export default ErrorComponent; // 🎁 Error-Anzeiger exportieren! TypeScript zeigt nur Errors! 🚨