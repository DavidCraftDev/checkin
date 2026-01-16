// 👤 USER UTILITIES! Managing users like a boss! 💪
import "server-only"; // 🚫 Server-only! No client peeking!

// 🎪 Import party! Security and database tools! 🛡️
import { hash } from "bcryptjs"; // 🔐 Password hashing! Security first! 
import db from "./db"; // 🗄️ Database connection!
import { User } from "@prisma/client"; // 👤 User type!

// 🔍 Get user by ID! Who are you? 🆔
export async function getUserPerID(id: string, auth: boolean = false) {
  // 🎯 Find that unique user! Where are you hiding? 👀
  const user = await db.user.findUnique({
    where: {
      id: id // 🆔 Match the ID!
    }
  });
  if (!user) return {} as User; // 🚫 User not found? Return empty! 
  // 🔐 If not auth mode, hide the password! Security matters! 🛡️
  if (!auth) {
    user.password = ""; // 🙈 Clear the password! No peeking!
    user.pwdLastSet = new Date(); // ⏰ Update timestamp!
  }
  return user; // 🎁 Here's your user!
}

// ✅ Check if user exists! Are you real? 🤔
export async function existUserPerID(id: string) {
  // 🔢 Count users with this ID! Should be 0 or 1!
  const user = await db.user.count({
    where: {
      id: id // 🆔 Match the ID!
    }
  });
  return user > 0; // ✅ True if user exists! Boolean magic! 🎩
}

// 🔍 Get user by username! What's your name? 📛
export async function getUserPerUsername(name: string) {
  // 🎯 Find user by username! Lowercase for consistency! 🔤
  const user = await db.user.findUnique({
    where: {
      username: name.toLowerCase() // 🔤 Always lowercase! No case sensitivity drama! 
    }
  });
  return user; // 🎁 Here's your user (or null)!
}

// ➕ Create a new user! Welcome to the system! 🎉
export async function createUser(name: string, displayname: string, permission: number, group: string[], needs: string[], competence: string[], password: string) {
  const passwordHash = await hash(password, 12); // 🔐 Hash that password! 12 rounds of security! 💪
  // 🔍 Check if username already exists! No duplicates allowed! 🚫
  const username = await db.user.count({
    where: {
      username: name.toLowerCase() // 🔤 Lowercase check!
    }
  });
  if (username > 0) return {} as User; // 🚫 Username taken! Return empty!
  // 🎪 Create the user! Let's make it happen! ✨
  const user = await db.user.create({
    data: {
      username: name.toLowerCase(), // 🔤 Username (lowercase)!
      displayname: displayname, // 📛 Display name (fancy)!
      permission: permission, // 🎫 Permission level!
      group: group, // 👥 Groups!
      needs: needs, // 📚 Needed study times!
      competence: competence, // 🎓 Competencies!
      password: passwordHash // 🔐 Hashed password! Safe and sound! 🛡️
    }
  });
  return user; // 🎁 Here's your shiny new user! Welcome! 🎊
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