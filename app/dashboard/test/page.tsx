"use client"

import { isLDAPEnabled } from "@/app/src/modules/ldapUtilities";
import { useState } from "react";
import { handleSubmit } from "./handlesubmit";

export default  function TestPage() {
    const [result, setResult] = useState("")
    if(!isLDAPEnabled()) {
        return (
            <div>
            <h1>Test Page</h1>
            <p>State: {process.env.ldap}</p>
            </div>
        );
    }
    async function manageSubmit(event: any) {
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
