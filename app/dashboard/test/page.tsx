import ldapClient from "@/app/src/modules/ldap";

export default function TestPage() {
    let client = ldapClient
    return (
        <div>
        <h1>Test Page</h1>
        <p>This is a test page.</p>
        </div>
    );
}