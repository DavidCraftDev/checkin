// @ts-nocheck

import db from "@/app/src/modules/db";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAllUsers } from "./ldap";
import { Client } from "ldapts";
import { User } from "@prisma/client";
import { use_ldap, ldap_uri, ldap_tls_reject_unauthorized, auth_secret } from "./config";
import { existsSync, readFileSync } from 'fs';
import rateLimit from "./rateLimit";

let client: Client

if (use_ldap) {
  console.log("Connect to LDAP Server for auth " + ldap_uri + "...")
  let certExists = existsSync(process.cwd() + "/cert.crt")
  let tlsOptions
  if (certExists) {
    tlsOptions = {
      rejectUnauthorized: ldap_tls_reject_unauthorized,
      ca: [readFileSync(process.cwd() + "/cert.crt").toString()]
    }
  } else {
    tlsOptions = {
      rejectUnauthorized: ldap_tls_reject_unauthorized
    }
  }
  try {
    client = new Client({
      url: ldap_uri,
      tlsOptions: tlsOptions
    });
  } catch (error) {
    throw new Error("Failed to create LDAP auth client: " + error);
  }
  console.log("LDAP client for auth created successfully!")
}

export const authOptions: NextAuthOptions = {
  secret: auth_secret,
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
      async authorize(credentials, request) {
        if (await rateLimit(request.headers["x-forwarded-for"])) return null;
        if (!credentials?.username || !credentials.password) return null;
        if (use_ldap && !credentials.username.startsWith("local/")) {
          const ldapUserData = await getAllUsers();
          const ldapUser = ldapUserData.find((e) => e.sAMAccountName === credentials.username);
          if (!ldapUser) {
            return null;
          }
          return new Promise(async (resolve, reject) => {
            console.log(ldapUser.dn)
            await client.bind(ldapUser.dn, credentials.password).catch((error) => {
              resolve(null)
            })
            const dbUser = await db.user.findUnique({
              where: {
                id: ldapUser.objectGUID as string,
              }
            }) as User | null
            if (!dbUser) {
              reject("User not found in database")
              return null
            }
            resolve({
              id: dbUser?.id as string,
              username: dbUser?.username,
              name: dbUser?.displayname,
              permission: dbUser?.permission,
              group: dbUser?.group,
              needs: dbUser?.needs,
              competence: dbUser?.competence,
              loginVersion: dbUser?.loginVersion

            })
          });
        } else {
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
        }
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
    },
  },
};
