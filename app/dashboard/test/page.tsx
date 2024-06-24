"use client"

import { useState } from "react";
import { handleSubmit } from "./handlesubmit";
import { useSearchParams } from 'next/navigation'

export default  function TestPage() {
    const [result, setResult] = useState("")
    const searchParams = useSearchParams()
    if(!searchParams.get("ldap")) {
        return (
            <div>
            <h1>Test Page</h1>
            <p>State: {process.env.ldap}</p>
            </div>
        );
    }
    async function manageSubmit(event: any) {
        event.preventDefault();
        await handleSubmit(event).then((result) => {
            setResult(String(result));
        });
    }
    return (
        <div>
        <h1>LDAP Page</h1>
        <p>State: {process.env.ldap}</p>
            <form onSubmit={manageSubmit}>
                <label htmlFor="filter">Filter:</label>
                <input type="text" id="filter" name="filter" />
                <label htmlFor="base">Base:</label>
                <input type="text" id="base" name="base" />
                <label htmlFor="attributes">Attributes:</label>
                <input type="text" id="attributes" name="attributes" />
                <button type="submit">Submit</button>
            </form>
            <pre>Ergebnis: {result}</pre>
        </div>
    );
}
