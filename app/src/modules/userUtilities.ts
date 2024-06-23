import { hash } from "bcryptjs";
import db from "./db";
import { Prisma } from "@prisma/client";
import { randomInt } from "crypto";
import moment from "moment";
import { isStudyTimeEnabled, saveNeededStudyTimes } from "./studytimeUtilities";

let saveNeedsCache = new Map<string, number>();

export async function getUserPerID(id: string) {
  const user = await db.user.findUnique({
    where: {
      id: id
    }
  });
  if (!user) return {} as any;
  if (await isStudyTimeEnabled()) {
    const cacheValue = saveNeedsCache.get(user.id) || -1;
    if (!saveNeedsCache.has(user.id) || !saveNeedsCache.get(user.id) || cacheValue !== moment().week()) {
      {
        saveNeedsCache.set(user.id, moment().week());
        saveNeededStudyTimes(user);
      }
    }
  }
  return user;
}

export async function existUserPerID(id: string) {
  const user = await db.user.count({
    where: {
      id: id
    }
  });
  if (!user) return 0 as Number;
  return user
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