"use client";

import { useState, useEffect, useRef } from "react";
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image'

const tips = [
    "Hallo ich bin Stuhu! Ich bin hier, um dir mit dem CheckIN, den Studienzeitsystem und dem Schulaltag zu helfen!",
    "Plane deine Aufgaben frühzeitig, um Stress zu vermeiden!",
    "Belohne dich nach getaner Arbeit mit etwas, das dir Spaß macht!",
    "Halte deinen Arbeitsplatz sauber und organisiert!",
    "Mach regelmäßige Pausen, um konzentriert zu bleiben",
    "Nutze die Pomodoro-Technik: 25 Minuten konzentriert arbeiten, dann 5 Minuten Pause!",
    "Setze dir realistische Ziele und teile große Aufgaben in kleinere Schritte auf!",
    "Denk am Ende der Woche daran, dass du alle Studienzeiten dokumentiert hast!",
    "Ein durchschnittlicher Q1 Schüler braucht 10 Studienzeiten pro Woche!",
    "Denk frühzeitig daran, deine Schüler einzuscannen!",
    "Denk daran, deine Studienzeiten zu dokumentieren!",
    "Denk daran, deine Schüler rechtzeitig einzuscannen!",
    "Studienzeiten werden nur im CheckIN dokumentiert!",
    "Du kannst Schüler über den QR-Code und der Nutzersuche zu Studienzeiten hinzufügen!",
    "Wenn eine Studienzeit ausfällt oder du krank bist, dokumentiere das mit einer Notiz mit dem Grund!",
    "Wenn du eine Studienzeit nicht dokumentierst, wird sie als unentschuldigt gewertet!",
    "Wenn du aufgrund eines Ausfalls eine Paralle Studienzeit besuchst, dokumentiere in der Schülernotiz den Grund!",
    "Dein QR-Code ist einmalig und wird nie geändert!",
    "Bereite dich 5 Minuten vor Ende der Studienzeit deinen QR-Code vor!",
    "Wenn du Technische Probleme hast, wende dich an die IT-Hilfe!",
    "Sei pünktlich da!",
    "Entferne Kaffeeflecken frühzeitig, vor sie eintrocknen!",
    "Lass keine Kaffeetassen in den Klassenräumen stehen!",
    "Kaffee ist kein Ersatz für Schlaf!",
    "Kaffee wurde im 16. Jahrhundert von manchen als satanisches Getränk bezeichnet – heute ist er für Lehrer überlebensnotwendig!",
    "Espresso hat weniger Koffein pro Portion als Filterkaffee. Dafür ist er schneller weg!",
    "Die teuerste Kaffeesorte der Welt wird von Schleichkatzen verdaut und wieder ausgeschieden. Genieße deinen normalen Kaffee!",
    "Koffein blockiert das Adenosin im Gehirn, was dich wach hält. Perfekt für lange Schulstunden!",
    "Überprüfe regelmäßig die Dokumentierten Studienzeiten deines Jahrgangs!",
    "Entferne keinen Schüler grundlos aus einer Studienzeit!",
    "Schreibe mit Lehrern und Schülern über Nextcloud-Talk!",
    "Speichere deine Dateien in der Nextcloud!",
    "Verwende das CheckIN-System, um deine Studienzeiten zu dokumentieren!",
    "Verwende Moodle, um Abgaben abzugeben!",
    "Auf Moodle findest du dein Arbeitsmaterial!"
];

function StuhuTips() {
    const [showTip, setShowTip] = useState(true);
    const [tipIndex, setTipIndex] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex(Math.floor(Math.random() * tips.length));
            setShowTip(true);
            if (audioRef.current) {
                audioRef.current.play();
            }
        }, Math.random() * 90000 + 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto">
            {showTip && (
                <div className="relative w-fit max-w-128 p-4 bg-white border-gray-200 border-2 rounded-md shadow-lg">
                    <div className="flex items-center gap-4">
                        <button
                            className="absolute top-2 right-2 p-1 text-black cursor-pointer"
                            onClick={() => setShowTip(false)}
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                        <Image
                            src="/stuhu.png"
                            alt="Stuhu"
                            width={200}
                            height={200}
                            className="rounded-xs"
                        />
                        <p className="text-sm break-after-auto">{tips[tipIndex]}</p>
                    </div>
                </div>
            )}
            <audio src="/uhu.mp3" ref={audioRef} preload="auto" />
        </div>
    );
};

export default StuhuTips;
