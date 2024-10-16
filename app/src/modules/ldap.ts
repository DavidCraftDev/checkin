import { existsSync, readFileSync } from "fs";
import { Client, Entry } from "ldapts";
import logger from "./logger";
import path from "path";
import { config_data } from "./config/config";

class LDAP {
    public readonly client: Client;

    private binded: boolean = false;

    public constructor() {
        let tlsOptions
        const certPath = path.join(process.cwd(), "data", "cert.crt");
        const oldCertPath = path.join(process.cwd(), "cert.crt");
        if (existsSync(certPath)) {
            tlsOptions = {
                rejectUnauthorized: config_data.LDAP.TLS_REJECT_UNAUTHORIZED,
                ca: [readFileSync(certPath)]
            }
            logger.info("Using custom certificate for LDAP connection", "LDAP")
        } else if (existsSync(oldCertPath)) {
            tlsOptions = {
                rejectUnauthorized: config_data.LDAP.TLS_REJECT_UNAUTHORIZED,
                ca: [readFileSync(oldCertPath)]
            }
            logger.warn("Using custom certificate for LDAP connection. Please move the certificate to the new path in the data folder", "LDAP")
        } else {
            tlsOptions = { rejectUnauthorized: config_data.LDAP.TLS_REJECT_UNAUTHORIZED }
        }
        try {
            this.client = new Client({
                url: config_data.LDAP.URI,
                tlsOptions: tlsOptions
            });
        } catch (error) {
            logger.error("Failed to create LDAP client: " + error, "LDAP")
            throw new Error()
        }
    }

    public async bind(dn: string, password: string, logError: boolean = true): Promise<boolean> {
        try {
            await this.client.bind(dn, password);
            this.binded = true;
            return true;
        } catch (error) {
            if (logError) logger.error("LDAP bind failed: " + error, "LDAP")
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
            logger.error("Not binded to LDAP Server", "LDAP")
            return []
        }
        const { searchEntries } = await this.client.search(base, {
            scope: 'sub',
            filter: filter,
            explicitBufferAttributes: ['objectGUID']
        })
        return searchEntries
    }

    public isBinded(): boolean {
        if (this.binded && this.client.isConnected) return true;
        this.binded = false;
        return false;
    }
}

export default LDAP;
