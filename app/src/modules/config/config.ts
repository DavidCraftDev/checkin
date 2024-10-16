import path from "path"
import fs from "fs"
import { generateSessionToken } from "../auth/sessionManager"
import logger from "../logger"

interface Config {
    MAINTANCE: boolean,
    SCHOOL_NAME: string,
    DEFAULT_LOGIN: {
        USERNAME: string,
        PASSWORD: string
    },
    LDAP: {
        ENABLE: boolean,
        URI: string,
        TLS_REJECT_UNAUTHORIZED: boolean,
        BIND_CREADENTIALS: {
            DN: string,
            PASSWORD: string
        },
        SEARCH_BASE: string,
        USER_SEARCH_FILTER: string,
        PASSWORD_RESET_URL: string,
        AUTOMATIC_DATA_DETECTION: {
            PERMISSION: {
                ENABLE: boolean,
                TEACHER_GROUP: string,
                ADMIN_GROUP: string
            },
            GROUPS: {
                ENABLE: boolean,
                GROUP_OU: string
            },
            STUDYTIME_DATA: {
                ENABLE: boolean,
                STUDYTIME_OU: string
            }
        }
    }
}

const defaultConfig: Config = {
    MAINTANCE: false,
    SCHOOL_NAME: "Beispiel Schule",
    DEFAULT_LOGIN: {
        USERNAME: "Own.Username",
        PASSWORD: ""
    },
    LDAP: {
        ENABLE: false,
        URI: "",
        TLS_REJECT_UNAUTHORIZED: false,
        BIND_CREADENTIALS: {
            DN: "",
            PASSWORD: ""
        },
        SEARCH_BASE: "",
        USER_SEARCH_FILTER: "",
        PASSWORD_RESET_URL: "",
        AUTOMATIC_DATA_DETECTION: {
            PERMISSION: {
                ENABLE: false,
                TEACHER_GROUP: "",
                ADMIN_GROUP: ""
            },
            GROUPS: {
                ENABLE: false,
                GROUP_OU: ""
            },
            STUDYTIME_DATA: {
                ENABLE: false,
                STUDYTIME_OU: ""
            }
        }
    }
}

export let config_data: Config;
const configPath = path.join(process.cwd(), "data", "config.json");

export async function readConfig(write: boolean = true) {
    const configPathOld = path.join(process.cwd(), "config.json");
    if (fs.existsSync(configPath)) {
        try {
            let imported_config: Partial<Config> = JSON.parse(fs.readFileSync(configPath, "utf-8"));
            config_data = Object.assign({}, defaultConfig, imported_config);
            if (!imported_config.DEFAULT_LOGIN || !imported_config.DEFAULT_LOGIN.PASSWORD || imported_config.DEFAULT_LOGIN.PASSWORD === "") config_data.DEFAULT_LOGIN.PASSWORD = generateSessionToken();
            if(process.env.NODE_ENV === "production") logger.info("Loaded config file.", "Config");
        } catch (error) {
            logger.error("Error reading or parsing config file:" +  error, "Config");
        }
    } else if (fs.existsSync(configPathOld)) {
        try {
            let imported_config: Partial<Config> = JSON.parse(fs.readFileSync(configPathOld, "utf-8"));
            config_data = Object.assign({}, defaultConfig, imported_config);
            if (!imported_config.DEFAULT_LOGIN || !imported_config.DEFAULT_LOGIN.PASSWORD || imported_config.DEFAULT_LOGIN.PASSWORD === "") config_data.DEFAULT_LOGIN.PASSWORD = generateSessionToken();
            logger.info("Found old config file. Automaticlly created a copy on the new path.", "Config");
        } catch (error) {
            logger.error("Error reading or parsing config file:" +  error, "Config");
        }
    } else {
        config_data = defaultConfig;
        config_data.DEFAULT_LOGIN.PASSWORD = generateSessionToken();
        logger.warn("No config file found. Using default config.", "Config");
    }
    if (write) writeConfig();
}

export async function writeConfig() {
    if (process.env.MAINTANCE) config_data.MAINTANCE = process.env.MAINTANCE === "true";
    if (process.env.SCHOOL_NAME) config_data.SCHOOL_NAME = process.env.SCHOOL_NAME;
    if (process.env.DEFAULT_LOGIN_USERNAME) config_data.DEFAULT_LOGIN.USERNAME = process.env.DEFAULT_LOGIN_USERNAME;
    if (process.env.DEFAULT_LOGIN_PASSWORD) config_data.DEFAULT_LOGIN.PASSWORD = process.env.DEFAULT_LOGIN_PASSWORD
    if (process.env.USE_LDAP) config_data.LDAP.ENABLE = process.env.USE_LDAP === "true";
    if (process.env.LDAP_URI) config_data.LDAP.URI = process.env.LDAP_URI;
    if (process.env.LDAP_TLS_REJECT_UNAUTHORIZED) config_data.LDAP.TLS_REJECT_UNAUTHORIZED = process.env.LDAP_TLS_REJECT_UNAUTHORIZED === "true";
    if (process.env.LDAP_BIND_DN) config_data.LDAP.BIND_CREADENTIALS.DN = process.env.LDAP_BIND_DN;
    if (process.env.LDAP_BIND_PASSWORD) config_data.LDAP.BIND_CREADENTIALS.PASSWORD = process.env.LDAP_BIND_PASSWORD;
    if (process.env.LDAP_SEARCH_BASE) config_data.LDAP.SEARCH_BASE = process.env.LDAP_SEARCH_BASE;
    if (process.env.LDAP_USER_SEARCH_FILTER) config_data.LDAP.USER_SEARCH_FILTER = process.env.LDAP_USER_SEARCH_FILTER;
    if (process.env.LDAP_PASSWORD_RESET_URL) config_data.LDAP.PASSWORD_RESET_URL = process.env.LDAP_PASSWORD_RESET_URL;
    if (process.env.LDAP_AUTO_PERMISSION) config_data.LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.ENABLE  = process.env.LDAP_AUTO_PERMISSION === "true";
    if (process.env.LDAP_AUTO_PERMISSION_TEACHER_GROUP) config_data.LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.TEACHER_GROUP = process.env.LDAP_AUTO_PERMISSION_TEACHER_GROUP;
    if (process.env.LDAP_AUTO_PERMISSION_ADMIN_GROUP) config_data.LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.ADMIN_GROUP = process.env.LDAP_AUTO_PERMISSION_ADMIN_GROUP;
    if (process.env.LDAP_AUTO_GROUPS_DETECTION) config_data.LDAP.AUTOMATIC_DATA_DETECTION.GROUPS.ENABLE = process.env.LDAP_AUTO_GROUPS_DETECTION === "true";
    if (process.env.LDAP_AUTO_GROUPS_OU) config_data.LDAP.AUTOMATIC_DATA_DETECTION.GROUPS.GROUP_OU = process.env.LDAP_AUTO_GROUPS_OU;
    if (process.env.LDAP_AUTO_STUDYTIME_DATA) config_data.LDAP.AUTOMATIC_DATA_DETECTION.STUDYTIME_DATA.ENABLE = process.env.LDAP_AUTO_STUDYTIME_DATA === "true";
    if (process.env.LDAP_AUTO_STUDYTIME_DATA_OU) config_data.LDAP.AUTOMATIC_DATA_DETECTION.STUDYTIME_DATA.STUDYTIME_OU = process.env.LDAP_AUTO_STUDYTIME_DATA_OU;
    if (!fs.existsSync(path.join(process.cwd(), "data"))) {
        fs.mkdirSync(path.join(process.cwd(), "data"));
        logger.info("Created data directory.", "Config");
    }
    fs.writeFileSync(configPath, JSON.stringify(config_data, null, 4));
    readConfig(false);
}

readConfig();
