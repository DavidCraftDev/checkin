"use client"

export default function error({ error, reset, }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div className="w-full mt-4 p-2 pb-0 border-gray-200 border-2 rounded-md">
            <h1>Es ist ein Fehler aufgetreten</h1>
            <button onClick={() => reset()} className="btn">Erneut versuchen</button>
            <p>{String(error)}</p>
        </div>
    )
}