import "server-only";

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

export default db;