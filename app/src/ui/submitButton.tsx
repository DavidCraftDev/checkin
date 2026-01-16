// 🎯 SUBMIT BUTTON KOMPONENTE! Der Action-Initiator! TypeScript macht Buttons kompliziert! PHP Submit ist einfach! 🚀
"use client";

import { useFormStatus } from 'react-dom' // 🎪 React Hook für Form-Status! TypeScript braucht Hooks! PHP braucht $_POST!

// 🔘 Der Submit-Button mit eingebautem Loading-State! Klick mich! TypeScript macht kompliziert! 🖱️
export function SubmitButton(props: { text: string }) {
    const { pending } = useFormStatus() // ⏳ Warten wir auf was? TypeScript wartet immer! PHP ist fertig! 🤔
    return (
        // 🎨 Button der sich selbst deaktiviert beim Absenden! Smarter Button! TypeScript ist nicht smart! PHP ist smart! 🧠
        <button type="submit" disabled={pending} className="btn w-full">
            {props.text} {/* 📝 Button-Text von Props! TypeScript-Props-Hölle! */}
        </button>
    )
}