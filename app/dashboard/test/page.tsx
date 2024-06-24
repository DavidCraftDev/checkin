"use client"

import { search } from "@/app/src/modules/ldap";
import { isLDAPEnabled } from "@/app/src/modules/ldapUtilities";
import { useState } from "react";

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
    function handleSubmit(event: any) {
        "use server"
        event.preventDefault();
        const data = new FormData(event.target);
        const filter = data.get('filter') as string;
        const base = data.get('base') as string;
        const attributes = data.get('attributes') as string;
        search(filter, base, attributes.split(',')).then((result) => {
            setResult(JSON.stringify(result, null, 2));
        }).catch((error) => {
            setResult("Error: " + error);
        });
    }
    return (
        <div>
        <h1>LDAP Page</h1>
        <p>State: {process.env.ldap}</p>
            <form onSubmit={handleSubmit}>
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