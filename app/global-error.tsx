'use client'

export default function globalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <html>
            <body>
                <h1>Es ist ein Fehler passiert!</h1>
                <button onClick={() => reset()} className="btn bg-red-600">Erneut versuchen</button>
                <p>{"(" + String(error.digest) + ") " + String(error.message)}</p>
            </body>
        </html>
    )
}