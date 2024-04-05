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
  if(!user) return "" as string;
  return user.id;
}

export async function createUser(name: string, displayname: string, permission: number, group: string, password: string) {
  const passwordHash = await hash(password, 12);
  const username = await db.user.count({
    where: {
      username: name.toLowerCase()
    }
  });
  if(username > 0) return "exist";
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

export async function updateUser(id: string, name: string, displayname: string, permission: number, group: string, password?: string) {
  let passwordHash
  if(password) {
    passwordHash = await hash(password, 12);
  }
  const userData = await getUserPerID(id);
  if(userData.username !== name) {
  const username = await db.user.count({
    where: {
      username: name.toLowerCase()
    }
  });
  if(username > 0) return "exist";
  }
  const data = new Array();
  if(password) {
    data.push({
      password: passwordHash
    });
  }
  data.push({
    username: name.toLowerCase(),
    displayname: displayname,
    permission: permission,
    group: group
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