import { hash } from "bcryptjs";
import db from "./db";
import { Prisma } from "@prisma/client";
import { randomInt } from "crypto";
import { saveNeededStudyTimes } from "./studytimeUtilities";
import { studytime } from "./config";

export async function getUserPerID(id: string) {
  const user = await db.user.findUnique({
    where: {
      id: id
    }
  });
  if (!user) return {} as any;
  if (studytime) {
    saveNeededStudyTimes(user);
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

export async function getUserID(name: string) {
  const user = await db.user.findUnique({
    where: {
      username: name.toLowerCase()
    }
  });
  if (!user) return "" as string;
  return user.id;
}

export async function createUser(name: string, displayname: string, permission: number, group: string, needs: Prisma.JsonArray, competence: Prisma.JsonArray, password: string) {
  const passwordHash = await hash(password, 12);
  const username = await db.user.count({
    where: {
      username: name.toLowerCase()
    }
  });
  if (username > 0) return "exist";
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

export async function updateUser(id: string, name: string, displayname: string, permission: number, group: string, needs: Prisma.JsonArray, competence: Prisma.JsonArray, password?: string) {
  let passwordHash
  if (password) {
    passwordHash = await hash(password, 12);
  }
  const userData = await getUserPerID(id);
  if (userData.username !== name) {
    const username = await db.user.count({
      where: {
        username: name.toLowerCase()
      }
    });
    if (username > 0) return "exist";
  }
  const data = new Array();
  if (password) {
    data.push({
      password: passwordHash
    });
  }
  let loginVersion: number = randomInt(1000000);
  data.push({
    username: name.toLowerCase(),
    displayname: displayname,
    permission: permission,
    group: group,
    needs: needs,
    competence: competence,
    loginVersion: loginVersion
  });
  const user = await db.user.update({
    where: {
      id: id
    },
    data: {
      ...data[0]
    }
  });
  return user;
}