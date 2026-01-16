import logger from "../app/src/modules/logger";
import { getAllUsers } from "../app/src/modules/ldap/ldapUtilities";

export async function seedLdapData() {
    await getAllUsers()
    logger.info("LDAP data seeded successfully!", "Seed")
    return
}