import logger from "@/app/src/modules/logger";
import { getAllUsers } from "@/app/src/modules/ldap/ldapUtilities";

export async function seedLdapData() {
    await getAllUsers()
    logger.info("Die LDAP-Daten wurden erfolgreich in die Register eingespeist — die Bürokratie gedeiht", "Seed")
    return
}