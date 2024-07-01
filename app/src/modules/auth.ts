import db from "@/app/src/modules/db";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { convertGUIDToString, getAllUsers, search } from "./ldap";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        username: {
          label: "Nutzername",
          type: "text",
          placeholder: "muster.user",
        },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          return null;
        }
        if (!process.env.USE_LDAP && credentials.username.startsWith("local/")) {
          const user = await db.user.findUnique({
            where: {
              username: credentials.username.toLowerCase(),
            },
          });

          if (!user || !user.password || !(await compare(credentials.password, user.password))) {
            return null;
          }

          return {
            id: user.id,
            username: user.username,
            name: user.displayname,
            permission: user.permission,
            group: user.group,
            needs: user.needs,
            competence: user.competence,
            loginVersion: user.loginVersion,
          };
        } else {
          if(!process.env.LDAP_SEARCH_BASE) throw new Error("LDAP_SEARCH_BASE is required");
          const userLDAPData = await search(`(&(sAMAccountName=${credentials.username})(objectClass=user))`, process.env.LDAP_SEARCH_BASE);
          if (userLDAPData.length < 1) {
            return null;
          }
          const user = userLDAPData[0];
          const userid = await convertGUIDToString(user.objectGUID as Buffer)
          console.log(user);
          const userData = await db.user.update({
            where: {
              id: userid
            },
            data: {
              username: String(user.sAMAccountName),
              displayname: String(user.displayName)
            }
          })
          console.log(userData)
          return {
            id: userid,
            username: user.sAMAccountName,
            name: user.displayName,
            permission: 0,
            group: "Test",
            needs: ["Ja"],
            competence: ["Ja"],
            loginVersion: 0,
          };
        }
      }
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      //console.log("Session Callback", { session, token });
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
        },
      };
    },
    jwt: ({ token, user }) => {
      //console.log("JWT Callback", { token, user });
      if (user) {
        const u = user as unknown as any;
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
    async redirect({ url, baseUrl }) {
      return baseUrl
    }
  },
};
