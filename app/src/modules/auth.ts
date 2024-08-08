import db from "@/app/src/modules/db";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAllUsers } from "./ldapUtilities";
import { User } from "@prisma/client";
import { use_ldap, auth_secret } from "./config";
import RateLimit from "./rateLimit";
import LDAP from "./ldap";

let rateLimiter = new RateLimit();

let client: LDAP;

if (use_ldap) client = new LDAP();

export const authOptions: NextAuthOptions = {
  secret: auth_secret,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        username: { label: "Nutzername", type: "text", placeholder: "muster.user" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials, request) {
        if (!request.headers || rateLimiter.rateLimit(request.headers["x-forwarded-for"])) return null;
        if (!credentials || !credentials.username || !credentials.password) return null;
        let user: User;
        if (use_ldap && !credentials.username.startsWith("local/")) {
          const ldapUserData = await getAllUsers();
          const ldapUser = ldapUserData.find((e) => e.sAMAccountName.toString().toLowerCase() === credentials.username.toLowerCase());
          if (!ldapUser) return null;
          if (await client.bind(ldapUser.dn, credentials.password)) {
            const dbUser = await db.user.findUnique({
              where: {
                id: ldapUser.objectGUID as string,
              }
            }) as User
            if (!dbUser) return null;
            user = dbUser;
            client.unbind();
          } else {
            client.unbind();
            return null;
          }
        } else {
          const dbUser = await db.user.findUnique({
            where: {
              username: credentials.username.toLowerCase(),
            },
          });
          if (!dbUser || !dbUser.password || !(await compare(credentials.password, dbUser.password))) return null;
          user = dbUser
        }
        return {
          id: user.id,
          username: user.username,
          name: user.displayname,
          permission: user.permission,
          group: user.group,
          needs: user.needs,
          competence: user.competence,
          loginVersion: user.loginVersion
        };
      }
    })
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          username: token.username,
          permission: token.permission,
          group: token.group,
          needs: token.needs,
          competence: token.competence,
          loginVersion: token.loginVersion,
        }
      };
    },
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as User;
        return {
          ...token,
          id: u.id,
          username: u.username,
          permission: u.permission,
          group: u.group,
          loginVersion: u.loginVersion,
        };
      }
      return token;
    },
    async redirect({ baseUrl }) {
      return baseUrl
    }
  }
};
