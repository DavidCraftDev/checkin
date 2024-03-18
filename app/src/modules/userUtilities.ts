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
      username: name
    }
  });
  console.log(user)
  if(!user) return "" as string;
  return user.id;
}