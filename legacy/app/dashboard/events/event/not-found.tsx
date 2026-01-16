import { Metadata } from "next";

function NotFound() {
    return (
        <div>
            <h1>404 - Event nicht gefunden</h1>
            <p>Das Event, das du suchst, existiert nicht.</p>
        </div>
    )
}

export default NotFound;

export const metadata: Metadata = {
    title: "404 - Event nicht gefunden - CheckIN-System",
    description: "Das Event, das du suchst, existiert nicht."
};