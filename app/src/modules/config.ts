import config_file from "../../../config.json";

let maintance: boolean
if (process.env.MAINTANCE === "true") {
    maintance = true
} else if (process.env.MAINTANCE === "false") {
    maintance = false
} else {
    maintance = config_file.MAINTANCE
}
if (maintance == null) maintance = false

let auth_secret: string
if (process.env.AUTH_SECRET) {
    auth_secret = process.env.AUTH_SECRET
} else {
    auth_secret = config_file.AUTH_SECRET
}
if (!auth_secret) throw new Error("AUTH_SECRET is not set")

let default_username: string
if (process.env.DEFAULT_LOGIN_USERNAME) {
    default_username = process.env.DEFAULT_LOGIN_USERNAME
} else {
    default_username = config_file.DEFAULT_LOGIN.USERNAME
}
// Check if default_username is set in LDAP configuration

let default_password: string
if (process.env.DEFAULT_LOGIN_PASSWORD) {
    default_password = process.env.DEFAULT_LOGIN_PASSWORD
} else {
    default_password = config_file.DEFAULT_LOGIN.PASSWORD
}
// Check if default_password is set in LDAP configuration

let studytime: boolean
if (process.env.STUDYTIME === "true") {
    studytime = true
} else if (process.env.STUDYTIME === "false") {
    studytime = false
} else {
    studytime = config_file.STUDYTIME
}
if (studytime == null) studytime = false

let use_ldap: boolean
if (process.env.USE_LDAP === "true") {
    use_ldap = true
} else if (process.env.USE_LDAP === "false") {
    use_ldap = false
} else {
    use_ldap = config_file.LDAP.ENABLE
}
if (use_ldap == null) use_ldap = false

let ldap_uri: string
if (process.env.LDAP_URI) {
    ldap_uri = process.env.LDAP_URI
} else {
    ldap_uri = config_file.LDAP.URI
}
if (!ldap_uri && use_ldap) throw new Error("LDAP_URI is not set")
    console.log(ldap_uri)
if (use_ldap && !ldap_uri.startsWith("ldap")) throw new Error("LDAP_URI must start with ldap:// or ldaps://")


let ldap_tls_options: {}
/*
if (process.env.LDAP_TLS_OPTIONS) {
    ldap_tls_options = JSON.parse(process.env.LDAP_TLS_OPTIONS)
} else {
    ldap_tls_options = config_file.LDAP.TLS_OPTIONS
}
if (!ldap_tls_options) ldap_tls_options = {}*/

let ldap_bind_dn: string
if (process.env.LDAP_BIND_DN) {
    ldap_bind_dn = process.env.LDAP_BIND_DN
} else {
    ldap_bind_dn = config_file.LDAP.BIND_CREADENTIALS.DN
}
if (!ldap_bind_dn && use_ldap) throw new Error("LDAP_BIND_DN is not set")
if (use_ldap && (!ldap_bind_dn.toLowerCase().includes("dc=") || !ldap_bind_dn.toLowerCase().includes("cn="))) throw new Error("LDAP_BIND_DN is not a valid DN")

let ldap_bind_password: string
if (process.env.LDAP_BIND_PASSWORD) {
    ldap_bind_password = process.env.LDAP_BIND_PASSWORD
} else {
    ldap_bind_password = config_file.LDAP.BIND_CREADENTIALS.PASSWORD
}
if (!ldap_bind_password && use_ldap) throw new Error("LDAP_BIND_PASSWORD is not set")

let ldap_search_base: string
if (process.env.LDAP_SEARCH_BASE) {
    ldap_search_base = process.env.LDAP_SEARCH_BASE
} else {
    ldap_search_base = config_file.LDAP.SEARCH_BASE
}
if (!ldap_search_base && use_ldap) throw new Error("LDAP_SEARCH_BASE is not set")
if (use_ldap && !ldap_search_base.toLowerCase().includes("dc=")) throw new Error("LDAP_SEARCH_BASE is not a valid Search Base")

let ldap_user_search_filter: string
if (process.env.LDAP_USER_SEARCH_FILTER) {
    ldap_user_search_filter = process.env.LDAP_USER_SEARCH_FILTER
} else {
    ldap_user_search_filter = config_file.LDAP.USER_SEARCH_FILTER
}
if (!ldap_user_search_filter && use_ldap) throw new Error("LDAP_USER_SEARCH_FILTER is not set")

let ldap_create_local_admin: boolean
if (process.env.LDAP_CREATE_LOCAL_ADMIN === "true") {
    ldap_create_local_admin = true
} else if (process.env.LDAP_CREATE_LOCAL_ADMIN === "false") {
    ldap_create_local_admin = false
} else {
    ldap_create_local_admin = config_file.LDAP.CREATE_LOCAL_ADMIN
}
if (ldap_create_local_admin == null) ldap_create_local_admin = true
if ((!use_ldap || (use_ldap && ldap_create_local_admin)) && (!default_username)) throw new Error("Default username is not set")
if ((!use_ldap || (use_ldap && ldap_create_local_admin)) && (!default_password)) throw new Error("Default password is not set")

let ldap_auto_permission: boolean
if (process.env.LDAP_AUTO_PERMISSION === "true") {
    ldap_auto_permission = true
} else if (process.env.LDAP_AUTO_PERMISSION === "false") {
    ldap_auto_permission = false
} else {
    ldap_auto_permission = config_file.LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.ENABLE
}
if (ldap_auto_permission == null) ldap_auto_permission = false

let ldap_auto_permission_teacher_group: string
if (process.env.LDAP_AUTO_PERMISSION_TEACHER_GROUP) {
    ldap_auto_permission_teacher_group = process.env.LDAP_AUTO_PERMISSION_TEACHER_GROUP
} else {
    ldap_auto_permission_teacher_group = config_file.LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.TEACHER_GROUP
}
if (use_ldap && ldap_auto_permission && !ldap_auto_permission_teacher_group) throw new Error("LDAP_AUTO_PERMISSION_TEACHER_GROUP is not set")
if (use_ldap && ldap_auto_permission && (!ldap_auto_permission_teacher_group.toLowerCase().includes("cn=") || !ldap_auto_permission_teacher_group.toLowerCase().includes("OU=") || !ldap_auto_permission_teacher_group.toLowerCase().includes("DC="))) throw new Error("LDAP_AUTO_PERMISSION_TEACHER_GROUP is not a valid group DN")

let ldap_auto_permission_admin_group: string
if (process.env.LDAP_AUTO_PERMISSION_ADMIN_GROUP) {
    ldap_auto_permission_admin_group = process.env.LDAP_AUTO_PERMISSION_ADMIN_GROUP
} else {
    ldap_auto_permission_admin_group = config_file.LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.ADMIN_GROUP
}
if (use_ldap && ldap_auto_permission && !ldap_auto_permission_admin_group) throw new Error("LDAP_AUTO_PERMISSION_ADMIN_GROUP is not set")
if (use_ldap && ldap_auto_permission && (!ldap_auto_permission_admin_group.toLowerCase().includes("cn=") || !ldap_auto_permission_admin_group.toLowerCase().includes("OU=") || !ldap_auto_permission_admin_group.toLowerCase().includes("DC="))) throw new Error("LDAP_AUTO_PERMISSION_ADMIN_GROUP is not a valid group DN")

let ldap_auto_groups: boolean
if (process.env.LDAP_AUTO_GROUPS === "true") {
    ldap_auto_groups = true
} else if (process.env.LDAP_AUTO_GROUPS === "false") {
    ldap_auto_groups = false
} else {
    ldap_auto_groups = config_file.LDAP.AUTOMATIC_DATA_DETECTION.GROUPS.ENABLE
}
if (ldap_auto_groups == null) ldap_auto_groups = false

let ldap_auto_groups_ou: string
if (process.env.LDAP_AUTO_GROUPS_OU) {
    ldap_auto_groups_ou = process.env.LDAP_AUTO_GROUPS_OU
} else {
    ldap_auto_groups_ou = config_file.LDAP.AUTOMATIC_DATA_DETECTION.GROUPS.GROUP_OU
}
if (use_ldap && ldap_auto_groups && !ldap_auto_groups_ou) throw new Error("LDAP_AUTO_GROUPS_OU is not set")

let ldap_auto_studytime_data: boolean
if (process.env.LDAP_AUTO_STUDYTIME_DATA === "true") {
    ldap_auto_studytime_data = true
} else if (process.env.LDAP_AUTO_STUDYTIME_DATA === "false") {
    ldap_auto_studytime_data = false
} else {
    ldap_auto_studytime_data = config_file.LDAP.AUTOMATIC_DATA_DETECTION.STUDYTIME_DATA.ENABLE
}
if (ldap_auto_studytime_data == null) ldap_auto_studytime_data = false

let ldap_auto_studytime_data_ou: string
if (process.env.LDAP_AUTO_STUDYTIME_DATA_OU) {
    ldap_auto_studytime_data_ou = process.env.LDAP_AUTO_STUDYTIME_DATA_OU
} else {
    ldap_auto_studytime_data_ou = config_file.LDAP.AUTOMATIC_DATA_DETECTION.STUDYTIME_DATA.STUDYTIME_OU
}
if (use_ldap && ldap_auto_studytime_data && !ldap_auto_studytime_data_ou) throw new Error("LDAP_AUTO_STUDYTIME_DATA_OU is not set")


export { maintance, auth_secret, default_username, default_password, studytime, use_ldap, ldap_uri, ldap_tls_options, ldap_bind_dn, ldap_bind_password, ldap_search_base, ldap_user_search_filter, ldap_create_local_admin, ldap_auto_permission, ldap_auto_permission_teacher_group, ldap_auto_permission_admin_group, ldap_auto_groups, ldap_auto_groups_ou, ldap_auto_studytime_data, ldap_auto_studytime_data_ou }
