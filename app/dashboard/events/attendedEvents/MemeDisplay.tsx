"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const memes = [
    "bed.png",
    "conspiracy.png",
    "grandma.png",
    "headaches.png",
    "power.png",
    "teacherSick.png",
    "trade.png",
];

function Meme() {
    const [showMeme, setShowMeme] = useState(false);
    const [randomMeme, setRandomMeme] = useState("");
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    useEffect(() => {
        const showMemeParam = searchParams.get("showMeme");
        if( showMemeParam === "true") setShowMeme(true);
        else setShowMeme(false);

        if (showMeme) {
            const randomIndex = Math.floor(Math.random() * memes.length);
            setRandomMeme(memes[randomIndex]);
            setShowMeme(true);
            sessionStorage.setItem("memeShownThisWeek", "true");

            const timer = setTimeout(() => {
                setShowMeme(false);
            }, 15000);

            const params = new URLSearchParams(searchParams.toString());
            params.delete("showMeme");
            replace(`${pathname}?${params.toString()}`);

            return () => clearTimeout(timer);
        }
    }, [searchParams, pathname, replace, showMeme]);

    const handleClose = () => {
        setShowMeme(false);
    }

    if (!showMeme || !randomMeme) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="relative">
                <Image
                    src={`/memes/${randomMeme}`}
                    alt="Meme"
                    width={500}
                    height={500}
                    style={{ objectFit: "contain" }}
                />
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 bg-white text-black rounded-full p-2"
                >
                    X
                </button>
            </div>
        </div>
    );
}


export default function MemeDisplay(props: { isMissingStudyTimes: boolean }) {
    if(props.isMissingStudyTimes) return null;
    return (
        <Suspense fallback={<div></div>}>
            <Meme />
        </Suspense>
    )
}
