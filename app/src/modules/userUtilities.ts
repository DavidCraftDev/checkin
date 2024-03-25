import { hash } from "bcryptjs";
import db from "./db";

export async function getUserPerID(id: string) {
  const user = await db.user.findUnique({
    where: {
      id: id
    }
  });
  if(!user) return {} as any;
  return user;
}

export async function existUserPerID(id: string) {
  const user = await db.user.count({
    where: {
      id: id
    }
  });
  if(!user) return 0 as Number;
  return user
}

export async function getUserID(name: string) {
  const user = await db.user.findUnique({
    where: {
      username: name.toLowerCase()
    }
  });
  console.log(user)
  if(!user) return "" as string;
  return user.id;
}

export async function createUser(name: string, displayname: string, permission: number, group: string, password: string) {
  const passwordHash = await hash(password, 12);
  const user = await db.user.create({
    data: {
      username: name.toLowerCase(),
      displayname: displayname,
      permission: permission,
      group: group,
      password: passwordHash
    }
  });
  return user;
}