
import config_file from "../../../config.json";

// Maintenance Mode
let maintance: boolean = config_file.MAINTANCE ?? (process.env.MAINTANCE === "true" ? true : (process.env.MAINTANCE === "false" ? false : false));

// Auth Secret
let auth_secret: string = config_file.AUTH_SECRET || process.env.AUTH_SECRET || "";
if (!auth_secret) throw new Error("AUTH_SECRET is not set");

// Default Login Credentials
let default_username: string = config_file.DEFAULT_LOGIN.USERNAME || process.env.DEFAULT_LOGIN_USERNAME || "";
let default_password: string = config_file.DEFAULT_LOGIN.PASSWORD || process.env.DEFAULT_LOGIN_PASSWORD || "";

// Study Time
let studytime: boolean = config_file.STUDYTIME ?? (process.env.STUDYTIME === "true" ? true : (process.env.STUDYTIME === "false" ? false : false));

// LDAP Configuration
let use_ldap: boolean = config_file.LDAP.ENABLE ?? (process.env.USE_LDAP === "true" ? true : (process.env.USE_LDAP === "false" ? false : false));

let ldap_uri: string = config_file.LDAP.URI || process.env.LDAP_URI || "";
if (!ldap_uri && use_ldap) throw new Error("LDAP_URI is not set");
if (use_ldap && !ldap_uri.startsWith("ldap")) throw new Error("LDAP_URI must start with ldap:// or ldaps://");

let ldap_tls_reject_unauthorized: boolean = config_file.LDAP.TLS_REJECT_UNAUTHORIZED ?? (process.env.LDAP_TLS_REJECT_UNAUTHORIZED === "true" ? true : (process.env.LDAP_TLS_REJECT_UNAUTHORIZED === "false" ? false : true));

let ldap_bind_dn: string = config_file.LDAP.BIND_CREADENTIALS.DN || process.env.LDAP_BIND_DN || "";
if (!ldap_bind_dn && use_ldap) throw new Error("LDAP_BIND_DN is not set");
if (use_ldap && (!ldap_bind_dn.toLowerCase().includes("dc=") || !ldap_bind_dn.toLowerCase().includes("cn="))) throw new Error("LDAP_BIND_DN is not a valid DN");

let ldap_bind_password: string = config_file.LDAP.BIND_CREADENTIALS.PASSWORD || process.env.LDAP_BIND_PASSWORD || "";
if (!ldap_bind_password && use_ldap) throw new Error("LDAP_BIND_PASSWORD is not set");

let ldap_search_base: string = config_file.LDAP.SEARCH_BASE || process.env.LDAP_SEARCH_BASE || "";
if (!ldap_search_base && use_ldap) throw new Error("LDAP_SEARCH_BASE is not set");
if (use_ldap && !ldap_search_base.toLowerCase().includes("dc=")) throw new Error("LDAP_SEARCH_BASE is not a valid Search Base");

let ldap_user_search_filter: string = config_file.LDAP.USER_SEARCH_FILTER || process.env.LDAP_USER_SEARCH_FILTER || "";
if (!ldap_user_search_filter && use_ldap) throw new Error("LDAP_USER_SEARCH_FILTER is not set");

let ldap_password_reset_url: string = config_file.LDAP.PASSWORD_RESET_URL || process.env.LDAP_PASSWORD_RESET_URL || "";

let ldap_create_local_admin: boolean = config_file.LDAP.CREATE_LOCAL_ADMIN ?? (process.env.LDAP_CREATE_LOCAL_ADMIN === "true" ? true : (process.env.LDAP_CREATE_LOCAL_ADMIN === "false" ? false : true));
if ((!use_ldap || (use_ldap && ldap_create_local_admin)) && !default_username) throw new Error("Default username is not set");
if ((!use_ldap || (use_ldap && ldap_create_local_admin)) && !default_password) throw new Error("Default password is not set");

// LDAP Auto Permission
let ldap_auto_permission: boolean = config_file.LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.ENABLE ?? (process.env.LDAP_AUTO_PERMISSION === "true" ? true : (process.env.LDAP_AUTO_PERMISSION === "false" ? false : false));

let ldap_auto_permission_teacher_group: string = config_file.LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.TEACHER_GROUP || process.env.LDAP_AUTO_PERMISSION_TEACHER_GROUP || "";
if (use_ldap && ldap_auto_permission && !ldap_auto_permission_teacher_group) throw new Error("LDAP_AUTO_PERMISSION_TEACHER_GROUP is not set");
if (use_ldap && ldap_auto_permission && (!ldap_auto_permission_teacher_group.toLowerCase().includes("cn=") || !ldap_auto_permission_teacher_group.toLowerCase().includes("ou=") || !ldap_auto_permission_teacher_group.toLowerCase().includes("dc="))) throw new Error("LDAP_AUTO_PERMISSION_TEACHER_GROUP is not a valid group DN");

let ldap_auto_permission_admin_group: string = config_file.LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.ADMIN_GROUP || process.env.LDAP_AUTO_PERMISSION_ADMIN_GROUP || "";
if (use_ldap && ldap_auto_permission && !ldap_auto_permission_admin_group) throw new Error("LDAP_AUTO_PERMISSION_ADMIN_GROUP is not set");
if (use_ldap && ldap_auto_permission && (!ldap_auto_permission_admin_group.toLowerCase().includes("cn=") || !ldap_auto_permission_admin_group.toLowerCase().includes("ou=") || !ldap_auto_permission_admin_group.toLowerCase().includes("dc="))) throw new Error("LDAP_AUTO_PERMISSION_ADMIN_GROUP is not a valid group DN");

let ldap_auto_groups: boolean = config_file.LDAP.AUTOMATIC_DATA_DETECTION.GROUPS.ENABLE ?? (process.env.LDAP_AUTO_GROUPS === "true" ? true : (process.env.LDAP_AUTO_GROUPS === "false" ? false : false));

let ldap_auto_groups_ou: string = config_file.LDAP.AUTOMATIC_DATA_DETECTION.GROUPS.GROUP_OU || process.env.LDAP_AUTO_GROUPS_OU || "";
if (use_ldap && ldap_auto_groups && !ldap_auto_groups_ou) throw new Error("LDAP_AUTO_GROUPS_OU is not set");
if (use_ldap && ldap_auto_groups && (!ldap_auto_groups_ou.toLowerCase().includes("ou=") || !ldap_auto_groups_ou.toLowerCase().includes("dc="))) throw new Error("LDAP_AUTO_GROUPS_OU is not a valid OU");

let ldap_auto_studytime_data: boolean = config_file.LDAP.AUTOMATIC_DATA_DETECTION.STUDYTIME_DATA.ENABLE ?? (process.env.LDAP_AUTO_STUDYTIME_DATA === "true" ? true : (process.env.LDAP_AUTO_STUDYTIME_DATA === "false" ? false : false));

let ldap_auto_studytime_data_ou: string = config_file.LDAP.AUTOMATIC_DATA_DETECTION.STUDYTIME_DATA.STUDYTIME_OU || process.env.LDAP_AUTO_STUDYTIME_DATA_OU || "";
if (use_ldap && ldap_auto_studytime_data && !ldap_auto_studytime_data_ou) throw new Error("LDAP_AUTO_STUDYTIME_DATA_OU is not set");
if (use_ldap && ldap_auto_studytime_data && (!ldap_auto_studytime_data_ou.toLowerCase().includes("ou=") || !ldap_auto_studytime_data_ou.toLowerCase().includes("dc="))) throw new Error("LDAP_AUTO_STUDYTIME_DATA_OU is not a valid OU");

export { 
    maintance, auth_secret, default_username, default_password, studytime, use_ldap, ldap_uri, ldap_tls_reject_unauthorized, 
    ldap_bind_dn, ldap_bind_password, ldap_search_base, ldap_user_search_filter, ldap_password_reset_url, ldap_create_local_admin, 
    ldap_auto_permission, ldap_auto_permission_teacher_group, ldap_auto_permission_admin_group, ldap_auto_groups, ldap_auto_groups_ou, 
    ldap_auto_studytime_data, ldap_auto_studytime_data_ou 
};
