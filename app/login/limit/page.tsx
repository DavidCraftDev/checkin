"use client";

import { useRouter } from "next/navigation";

function Limit() {
    const router = useRouter();
    setTimeout(() => {
        router.push("/login");
    }, 60000);
    return (
        <div>
            <h1>Du wurdest für 60 Sekunden gesperrt.</h1>
            <p>Du wirst automatisch zurück zur Login Seite geleitet.</p>
            <p>Ein Weiterer Vorzeitiger Login-Versuch Verlängert die Sperre.</p>
        </div>
    )
}

export default Limit;