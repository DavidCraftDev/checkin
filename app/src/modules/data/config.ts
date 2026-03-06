import 'dotenv/config';
import path from "path"
import fs from "fs"
import logger from "@/app/src/modules/logger"
import crypto from "crypto"

interface Config {
    MAINTENANCE: boolean;
    SCHOOL_NAME: string;
    POSTGRES_URL: string;
    DEFAULT_LOGIN: {
        USERNAME: string;
        PASSWORD: string;
    };
    LDAP: {
        ENABLE: boolean;
        URI: string;
        TLS_REJECT_UNAUTHORIZED: boolean;
        BIND_CREADENTIALS: {
            DN: string;
            PASSWORD: string;
        };
        SEARCH_BASE: string;
        USER_SEARCH_FILTER: string;
        PASSWORD_RESET_URL: string;
        AUTOMATIC_DATA_DETECTION: {
            PERMISSION: {
                ENABLE: boolean;
                TEACHER_GROUP: string;
                ADMIN_GROUP: string;
            };
            GROUPS: {
                ENABLE: boolean;
                GROUP_OU: string;
            };
            STUDYTIME_DATA: {
                ENABLE: boolean;
                STUDYTIME_OU: string;
            };
        };
    };
    UNTIS: {
        ENABLE: boolean;
        SCHOOL: string;
        USERNAME: string;
        PASSWORD: string;
        BASE_URL: string;
        CLASS_IDS?: number[];
        CLASS_NAMES?: string[];
    };
    MODULES: {
        SPONSORENLAUF: boolean;
    }
}

const defaultConfig: Config = {
    MAINTENANCE: false,
    SCHOOL_NAME: "",
    POSTGRES_URL: "",
    DEFAULT_LOGIN: {
        USERNAME: "Own.Username",
        PASSWORD: "",
    },
    LDAP: {
        ENABLE: false,
        URI: "",
        TLS_REJECT_UNAUTHORIZED: false,
        BIND_CREADENTIALS: {
            DN: "",
            PASSWORD: "",
        },
        SEARCH_BASE: "",
        USER_SEARCH_FILTER: "",
        PASSWORD_RESET_URL: "",
        AUTOMATIC_DATA_DETECTION: {
            PERMISSION: {
                ENABLE: false,
                TEACHER_GROUP: "",
                ADMIN_GROUP: "",
            },
            GROUPS: {
                ENABLE: false,
                GROUP_OU: "",
            },
            STUDYTIME_DATA: {
                ENABLE: false,
                STUDYTIME_OU: "",
            },
        },
    },
    UNTIS: {
        ENABLE: false,
        SCHOOL: "",
        USERNAME: "",
        PASSWORD: "",
        BASE_URL: "",
        CLASS_IDS: [],
    },
    MODULES: {
        SPONSORENLAUF: false,
    },
};

export let config_data: Config = { ...defaultConfig };
const configFilePath = path.join(process.cwd(), "data", "config.json");

export function readConfig(writeBack: boolean = true) {
    let loadedConfig: Partial<Config> = {};

    // Check if the config file exists and read it
    // If it doesn't exist, create it with default values
    try {
        if (fs.existsSync(configFilePath)) {
            loadedConfig = JSON.parse(fs.readFileSync(configFilePath, "utf-8"));
            config_data = Object.assign({}, defaultConfig, loadedConfig);
            logger.info("Loaded config file.", "Config");
        } else {
            logger.warn("No config file found. Using default config.", "Config");
        }
    } catch (error) {
        logger.error("Error reading or parsing config file:" + error, "Config");
    }

    // Check if the POSTGRES_URL is set
    if (!config_data.POSTGRES_URL || config_data.POSTGRES_URL === "") {
        logger.error("No POSTGRES_URL set in config file. Please set it before running the application.", "Config");
    }

    // Check if a password is set for the default login
    // If not, generate a random password and log a warning
    if (!config_data.DEFAULT_LOGIN.PASSWORD || config_data.DEFAULT_LOGIN.PASSWORD === "") {
        config_data.DEFAULT_LOGIN.PASSWORD = generateRandomSecurePassword();
        logger.warn("No default password for the local admin account was found. A new one has been generated.", "Config");
    }

    // Apply environment variable overrides
    applyEnvOverrides();

    if (writeBack) writeConfig();
}

export function writeConfig() {
    const dir = path.dirname(configFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info("Created config directory.", "Config");
    }
    fs.writeFileSync(configFilePath, JSON.stringify(config_data, null, 4));
}

function applyEnvOverrides() {
    const env = process.env;
    if (env.MAINTENANCE) config_data.MAINTENANCE = env.MAINTENANCE === "true";
    if (env.SCHOOL_NAME) config_data.SCHOOL_NAME = env.SCHOOL_NAME;
    if (env.POSTGRES_URL) config_data.POSTGRES_URL = env.POSTGRES_URL;
    if (env.DEFAULT_LOGIN_USERNAME) config_data.DEFAULT_LOGIN.USERNAME = env.DEFAULT_LOGIN_USERNAME;
    if (env.DEFAULT_LOGIN_PASSWORD) config_data.DEFAULT_LOGIN.PASSWORD = env.DEFAULT_LOGIN_PASSWORD;
    if (env.USE_LDAP) config_data.LDAP.ENABLE = env.USE_LDAP === "true";
    if (env.LDAP_URI) config_data.LDAP.URI = env.LDAP_URI;
    if (env.LDAP_TLS_REJECT_UNAUTHORIZED) config_data.LDAP.TLS_REJECT_UNAUTHORIZED = env.LDAP_TLS_REJECT_UNAUTHORIZED === "true";
    if (env.LDAP_BIND_DN) config_data.LDAP.BIND_CREADENTIALS.DN = env.LDAP_BIND_DN;
    if (env.LDAP_BIND_PASSWORD) config_data.LDAP.BIND_CREADENTIALS.PASSWORD = env.LDAP_BIND_PASSWORD;
    if (env.LDAP_SEARCH_BASE) config_data.LDAP.SEARCH_BASE = env.LDAP_SEARCH_BASE;
    if (env.LDAP_USER_SEARCH_FILTER) config_data.LDAP.USER_SEARCH_FILTER = env.LDAP_USER_SEARCH_FILTER;
    if (env.LDAP_PASSWORD_RESET_URL) config_data.LDAP.PASSWORD_RESET_URL = env.LDAP_PASSWORD_RESET_URL;
    if (env.LDAP_AUTO_PERMISSION) config_data.LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.ENABLE = env.LDAP_AUTO_PERMISSION === "true";
    if (env.LDAP_AUTO_PERMISSION_TEACHER_GROUP) config_data.LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.TEACHER_GROUP = env.LDAP_AUTO_PERMISSION_TEACHER_GROUP;
    if (env.LDAP_AUTO_PERMISSION_ADMIN_GROUP) config_data.LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.ADMIN_GROUP = env.LDAP_AUTO_PERMISSION_ADMIN_GROUP;
    if (env.LDAP_AUTO_GROUPS_DETECTION) config_data.LDAP.AUTOMATIC_DATA_DETECTION.GROUPS.ENABLE = env.LDAP_AUTO_GROUPS_DETECTION === "true";
    if (env.LDAP_AUTO_GROUPS_OU) config_data.LDAP.AUTOMATIC_DATA_DETECTION.GROUPS.GROUP_OU = env.LDAP_AUTO_GROUPS_OU;
    if (env.LDAP_AUTO_STUDYTIME_DATA) config_data.LDAP.AUTOMATIC_DATA_DETECTION.STUDYTIME_DATA.ENABLE = env.LDAP_AUTO_STUDYTIME_DATA === "true";
    if (env.LDAP_AUTO_STUDYTIME_DATA_OU) config_data.LDAP.AUTOMATIC_DATA_DETECTION.STUDYTIME_DATA.STUDYTIME_OU = env.LDAP_AUTO_STUDYTIME_DATA_OU;
    if (env.UNTIS_ENABLE) config_data.UNTIS.ENABLE = env.UNTIS_ENABLE === "true";
    if (env.UNTIS_SCHOOL) config_data.UNTIS.SCHOOL = env.UNTIS_SCHOOL;
    if (env.UNTIS_USERNAME) config_data.UNTIS.USERNAME = env.UNTIS_USERNAME;
    if (env.UNTIS_PASSWORD) config_data.UNTIS.PASSWORD = env.UNTIS_PASSWORD;
    if (env.UNTIS_BASE_URL) config_data.UNTIS.BASE_URL = env.UNTIS_BASE_URL;
    if (env.MODULE_SPONSORENLAUF) config_data.MODULES.SPONSORENLAUF = env.MODULE_SPONSORENLAUF === "true";
}

function generateRandomSecurePassword(): string {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?";

    return Array.from(crypto.randomFillSync(new Uint32Array(length))).map((x) => charset[x % charset.length]).join("");
}

readConfig();