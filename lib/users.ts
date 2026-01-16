import "server-only";
import { hash } from "bcryptjs";
import db from "@/lib/db";
import { User } from "@prisma/client";

export async function getUserById(id: string, auth: boolean = false): Promise<User | null> {
  const user = await db.user.findUnique({
    where: { id },
  });

  if (!user) return null;

  if (!auth) {
    return {
        ...user,
        password: null,
    };
  }
  return user;
}

export const getUserPerID = getUserById;

export async function userExists(id: string): Promise<boolean> {
  const count = await db.user.count({ where: { id } });
  return count > 0;
}
export const existUserPerID = userExists;

export async function getUserByUsername(username: string): Promise<User | null> {
  return db.user.findUnique({
    where: { username: username.toLowerCase() },
  });
}
export const getUserPerUsername = getUserByUsername;

export async function createUser(
  username: string,
  displayName: string,
  permission: number,
  groups: string[],
  needs: string[],
  competence: string[],
  password: string
): Promise<User | null> {
  const passwordHash = await hash(password, 12);
  const existingCount = await db.user.count({
    where: { username: username.toLowerCase() },
  });

  if (existingCount > 0) return null;

  return db.user.create({
    data: {
      username: username.toLowerCase(),
      displayName,
      permission,
      groups,
      needs,
      competence,
      password: passwordHash,
    },
  });
}

export async function updateUser(
  id: string,
  username: string,
  displayName: string,
  permission: number,
  groups: string[],
  needs: string[],
  competence: string[],
  password?: string
): Promise<User | "exist"> {
  const currentUser = await db.user.findUnique({ where: { id } });
  if (!currentUser) throw new Error("User not found");

  if (currentUser.username !== username.toLowerCase()) {
    const exists = await db.user.count({
      where: { username: username.toLowerCase() },
    });
    if (exists > 0) return "exist";
  }

  let passwordHash = undefined;
  if (password) {
    passwordHash = await hash(password, 12);
  }

  return db.user.update({
    where: { id },
    data: {
      username: username.toLowerCase(),
      displayName,
      permission,
      groups,
      needs,
      competence,
      ...(passwordHash ? { password: passwordHash, pwdLastSet: new Date() } : {}),
    },
  });
}

export async function searchUser(search: string) {
  return db.user.findMany({
    where: {
      OR: [
        { username: { contains: search, mode: "insensitive" } },
        { displayName: { contains: search, mode: "insensitive" } },
        { groups: { has: search } },
      ],
    },
  });
}
