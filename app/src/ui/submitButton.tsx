"use client";

import { useFormStatus } from 'react-dom'

export function SubmitButton(props: { text: string, className?: string }) {
    const { pending } = useFormStatus()
    return (
        <button type="submit" disabled={pending} className={`btn w-full ${props.className || ''} ${pending ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {pending ? 'Laden...' : props.text}
        </button>
    )
}
