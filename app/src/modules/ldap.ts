import { existsSync, readFileSync } from "fs";
import { ldap_tls_reject_unauthorized, ldap_uri } from './config';
import { Client, Entry } from "ldapts";

class LDAP {
    public readonly client: Client;

    private binded: boolean = false;

    public constructor() {
        let tlsOptions
        if (existsSync(process.cwd() + "/cert.crt")) {
            tlsOptions = {
                rejectUnauthorized: ldap_tls_reject_unauthorized,
                ca: [readFileSync(process.cwd() + "/cert.crt").toString()]
            }
        } else {
            tlsOptions = { rejectUnauthorized: ldap_tls_reject_unauthorized }
        }
        try {
            this.client = new Client({
                url: ldap_uri,
                tlsOptions: tlsOptions
            });
        } catch (error) {
            throw new Error("Failed to create LDAP client: " + error);
        }
    }

    public async bind(dn: string, password: string): Promise<boolean> {
        try {
            await this.client.bind(dn, password);
            this.binded = true;
            return true;
        } catch (error) {
            console.error(new Error("LDAP bind failed: " + error))
            this.binded = false;
            return false;
        }
    }

    public async unbind(): Promise<void> {
        await this.client.unbind();
        this.binded = false;
    }

    public async search(filter: string, base: string): Promise<Entry[]> {
        if (!this.binded || !this.client.isConnected) {
            this.binded = false;
            throw new Error("Not binded to LDAP Server");
        }
        const { searchEntries } = await this.client.search(base, {
            scope: 'sub',
            filter: filter,
            explicitBufferAttributes: ['objectGUID']
        })
        return searchEntries
    }

    public isBinded(): boolean {
        if(this.binded && this.client.isConnected) return true;
        this.binded = false;
        return false;
    }
}

export default LDAP;