// 🎯 SUBMIT BUTTON COMPONENT! The action initiator! 🚀
"use client";

import { useFormStatus } from 'react-dom' // 🎪 React hook for form status!

// 🔘 The submit button with built-in loading state! Click me! 🖱️
export function SubmitButton(props: { text: string }) {
    const { pending } = useFormStatus() // ⏳ Are we waiting for something? 🤔
    return (
        // 🎨 Button that disables itself when submitting! Smart button! 🧠
        <button type="submit" disabled={pending} className="btn w-full">
            {props.text} {/* 📝 Button text from props! */}
        </button>
    )
}