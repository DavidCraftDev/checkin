import { Metadata } from "next";

function NotFound() {
    return (
        <div>
            <h1>404 - Studienzeit nicht gefunden</h1>
            <p>Die Studienzeit, die du suchst, existiert nicht.</p>
        </div>
    )
}

export default NotFound;

export const metadata: Metadata = {
    title: "404 - Studienzeit nicht gefunden - CheckIN-System",
    description: "Die Studienzeit, die du suchst, existiert nicht."
};