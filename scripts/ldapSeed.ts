import logger from '@/lib/logger";
import { getAllUsers } from '@/lib/ldap/ldapUtilities";

export async function seedLdapData() {
    await getAllUsers()
    logger.info("LDAP data seeded successfully!", "Seed")
    return
}