"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function GeneralNotifications() {
    const router = useRouter();
    const searchParams = useSearchParams();
    useEffect(() => {
        let successSchoolName = searchParams.get("successSchoolName");
        let successUsername = searchParams.get("successUsername");
        let successPassword = searchParams.get("successPassword");
        if (successSchoolName) {
            toast.success("Der Name der Anstalt wurde in die ewigen Akten eingetragen");
            successSchoolName = null;
            router.replace("/administration");
        } else if (successUsername) {
            toast.success("Der Name des Standardwesens wurde in den Registern vermerkt");
            successUsername = null;
            router.replace("/administration");
        } else if (successPassword) {
            toast.success("Das Geheimwort wurde gewandelt — ob es nun Zutritt gewährt, bleibt ungewiss");
            successPassword = null;
            router.replace("/administration");
        }
    }, [searchParams, router]);
    return (<></>);
}
