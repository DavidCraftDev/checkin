"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

export function Notifications(props: { url: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    let warning = searchParams.get("warning");
    let sucess = searchParams.get("sucess");
    let error = searchParams.get("error");
    const newSearchParams = new URLSearchParams(searchParams.toString());
    useEffect(() => {
        if (warning) {
            toast(warning, { icon: "❗" });
            warning = null;
            newSearchParams.delete("warning");
            router.replace(props.url + "?" + newSearchParams.toString());
        } else if (sucess) {
            toast.success(sucess);
            sucess = null;
            newSearchParams.delete("sucess");
            router.replace(props.url + "?" + newSearchParams.toString());
        } else if (error) {
            toast.error(error);
            error = null;
            newSearchParams.delete("error");
            router.replace(props.url + "?" + newSearchParams.toString());
        }
    }, [warning, sucess, error]);
    return (<></>);
}