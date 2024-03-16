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