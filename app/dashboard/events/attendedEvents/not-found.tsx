import { Metadata } from "next";

async function NotFound() {
    return (
        <div>
            <h1>404 - Nutzer nicht gefunden</h1>
            <p>Der Nutzer, den du suchst, existiert nicht.</p>
        </div>
    )
}

export default NotFound;

export const metadata: Metadata = {
    title: "Nutzer nicht gefunden - CheckIN-System",
    description: "Der Nutzer, den du suchst, existiert nicht.",
}