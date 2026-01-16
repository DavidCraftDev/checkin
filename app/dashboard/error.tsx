// 💥 DASHBOARD ERROR COMPONENT! Oopsie daisy! 😅
"use client";

// 🚨 Error display component! When things don't go as planned! 
function ErrorComponent({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        // 📦 Error container! Nicely boxed error message! 🎁 (but not a good kind of gift!)
        <div className="w-full mt-4 p-2 pb-0 border-gray-200 border-2 rounded-md">
            <h1>Es ist ein Fehler aufgetreten</h1> {/* 😱 Error header! */}
            {/* 🔄 Try again button! Because first time's not always the charm! 🍀 */}
            <button onClick={reset} className="btn">Erneut versuchen</button>
            {/* 📝 Error message or default text! What went wrong? 🤔 */}
            <p className="mt-2">{error.message || "Unbekannter Fehler"}</p>
        </div>
    );
}

export default ErrorComponent; // 🎁 Export the error displayer! 🚨