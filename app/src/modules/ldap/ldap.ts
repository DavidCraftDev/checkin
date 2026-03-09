"use server";

import { existsSync, readFileSync } from "fs";
import { Client, Entry } from "ldapts";
import logger from "@/app/src/modules/logger"
import path from "path";
import { config_data } from "@/app/src/modules/data/config";

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
            logger.info("Ein eigenes Zertifikat wurde für die Verbindung zum LDAP-Verzeichnis vorgelegt", "LDAP")
        } else if (existsSync(oldCertPath)) {
            tlsOptions = {
                rejectUnauthorized: config_data.LDAP.TLS_REJECT_UNAUTHORIZED,
                ca: [readFileSync(oldCertPath)]
            }
            logger.warn("Ein Zertifikat am alten Ort wurde entdeckt — die Behörde bittet um Verlegung in das Datenarchiv", "LDAP")
        } else {
            tlsOptions = { rejectUnauthorized: config_data.LDAP.TLS_REJECT_UNAUTHORIZED }
        }
        try {
            this.client = new Client({
                url: config_data.LDAP.URI,
                tlsOptions: tlsOptions
            });
        } catch (error) {
            logger.error("Die Erschaffung des LDAP-Boten scheiterte: " + error, "LDAP")
            throw new Error()
        }
    }

    public async bind(dn: string, password: string, logError: boolean = true): Promise<boolean> {
        try {
            await this.client.bind(dn, password);
            this.binded = true;
            return true;
        } catch (error) {
            if (logError) logger.error("Die Bindung an das LDAP-Verzeichnis wurde verweigert: " + error, "LDAP")
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
            logger.error("Keine Bindung zum LDAP-Verzeichnis — das System schwebt im Nichts", "LDAP")
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