"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

export function LDAPNotifications() {
    const router = useRouter();
    const searchParams = useSearchParams();
    let success = searchParams.get("success");
    let error = searchParams.get("error");
    useEffect(() => {
        if (success) {
            toast.success(success);
            router.replace("/administration/ldap");
        } else if (error) {
            toast.error(error);
            router.replace("/administration/ldap");
        }
    }, [success, error]);
    return (<></>);
}