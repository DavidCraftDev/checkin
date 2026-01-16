import { Metadata } from "next";

function NotFound() {
    return (
        <div>
            <h1>404 - Unterrichtsstunde nicht gefunden</h1>
            <p>Die Stunde, das du suchst, existiert nicht.</p>
        </div>
    )
}

export default NotFound;

export const metadata: Metadata = {
    title: "404 - Unterrichtsstunde nicht gefunden - CheckIN-System",
    description: "Die Stunde, das du suchst, existiert nicht."
};