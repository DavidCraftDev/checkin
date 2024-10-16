import "server-only";

import { hash } from "bcryptjs";
import db from "./db";
import { User } from "@prisma/client";
import { randomInt } from "crypto";

export async function getUserPerID(id: string, auth: boolean = false) {
  const user = await db.user.findUnique({
    where: {
      id: id
    }
  });
  if (!user) return {} as User;
  if (!auth) {
    user.password = "";
    user.pwdLastSet = new Date();
  }
  return user;
}

export async function existUserPerID(id: string) {
  const user = await db.user.count({
    where: {
      id: id
    }
  });
  return user > 0;
}

export async function getUserPerUsername(name: string) {
  const user = await db.user.findUnique({
    where: {
      username: name.toLowerCase()
    }
  });
  return user;
}

export async function createUser(name: string, displayname: string, permission: number, group: string[], needs: string[], competence: string[], password: string) {
  const passwordHash = await hash(password, 12);
  const username = await db.user.count({
    where: {
      username: name.toLowerCase()
    }
  });
  if (username > 0) return {} as User;
  const user = await db.user.create({
    data: {
      username: name.toLowerCase(),
      displayname: displayname,
      permission: permission,
      group: group,
      needs: needs,
      competence: competence,
      password: passwordHash
    }
  });
  return user;
}

export async function updateUser(id: string, name: string, displayname: string, permission: number, group: string[], needs: string[], competence: string[], password?: string) {
  let passwordHash = "";
  if (password) passwordHash = await hash(password, 12)
  const userData = await getUserPerID(id);
  if (userData.username !== name) {
    const username = await db.user.count({
      where: {
        username: name.toLowerCase()
      }
    });
    if (username > 0) return "exist";
  }

  let data: any = {
    username: name.toLowerCase(),
    displayname: displayname,
    permission: permission,
    group: group,
    needs: needs,
    competence: competence,
    pwdLastSet: new Date()
  }
  if (password) data.password = passwordHash;
  const user = await db.user.update({
    where: {
      id: id
    },
    data: data
  });
  return user;
}

export async function searchUser(search: string) {
  const user = await db.user.findMany({
    where: {
      OR: [
        {
          username: {
            contains: search,
            mode: "insensitive"
          }
        },
        {
          displayname: {
            contains: search,
            mode: "insensitive"
          }
        },
        {
          group: {
            has: search
          }
        }
      ]
    }
  });
  return user;
}