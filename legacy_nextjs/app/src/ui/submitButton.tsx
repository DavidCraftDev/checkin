"use client";

import { useFormStatus } from 'react-dom'

export function SubmitButton(props: { text: string }) {
    const { pending } = useFormStatus()
    return (
        <button type="submit" disabled={pending} className="btn w-full">
            {props.text}
        </button>
    )
}