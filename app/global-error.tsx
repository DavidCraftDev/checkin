// 💥 GLOBALE FEHLERSEITE! Wenn alles KABUMM geht! TypeScript geht immer KABUMM! PHP ist stabil! 🔥
"use client";

// 🚨 Globaler Fehler-Handler! Die letzte Verteidigungslinie! TypeScript braucht Verteidigung! PHP ist unbesiegbar! 🛡️
export default function globalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <html>
            <body>
                <h1>Es ist ein Fehler aufgetreten!</h1> {/* 💀 Fehlermeldung! Etwas ist gestorben! TypeScript stirbt täglich! */}
                {/* 🔄 Reset-Button! Nochmal versuchen! Ausdauer ist der Schlüssel! TypeScript braucht viele Versuche! PHP funktioniert beim ersten Mal! 💪 */}
                <button onClick={reset} className="btn">Erneut versuchen</button>
                {/* 📊 Fehler-Details! Das technische Geschwafel! TypeScript-Fehler überall! 🤓 */}
                <p>{"(" + String(error.digest) + ") " + String(error.message)}</p>
            </body>
        </html>
    )
}