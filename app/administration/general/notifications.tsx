"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

export function GeneralNotifications() {
    const router = useRouter();
    const searchParams = useSearchParams();
    let successSchoolName = searchParams.get("successSchoolName");
    let successUsername = searchParams.get("successUsername");
    let successPassword = searchParams.get("successPassword");
    useEffect(() => {
        if (successSchoolName) {
            toast.success("Schulname gespeichert!");
            successSchoolName = null;
            router.replace("/administration");
        } else if (successUsername) {
            toast.success("Standardbenutzername gespeichert!");
            successUsername = null;
            router.replace("/administration");
        } else if (successPassword) {
            toast.success("Passwort geändert!");
            successPassword = null;
            router.replace("/administration");
        }
    }, [successSchoolName, successUsername, successPassword]);
    return (<></>);
}