"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

function LoginLimitPage() {
    const router = useRouter();
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.push("/login");
        }, 60000);
        return () => clearTimeout(timeout);
    }, [router]);
    return (
        <div>
            <h1>Du wurdest für 60 Sekunden gesperrt.</h1>
            <p>Du wirst automatisch zurück zur Login Seite geleitet.</p>
            <p>Ein weiterer vorzeitiger Login-Versuch verlängert die Sperre.</p>
        </div>
    )
}

export default LoginLimitPage;