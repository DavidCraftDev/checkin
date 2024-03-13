import db from "@/app/src/modules/db";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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

        const user = await db.user.findUnique({
          where: {
            username: credentials.username,
          },
        });

        if (!user || !(await compare(credentials.password, user.password))) {
          return null;
        }

        return {
          id: user.id,
          username: user.username,
          name: user.displayname,
          permission: user.permission,
          group: user.group,
        };
      },
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
        };
      }
      return token;
    },
  },
};
