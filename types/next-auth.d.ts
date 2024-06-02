import NextAuth from "next-auth"
import internal from "stream"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      username: string
      name: string
      permission: int
      group: string
      needs: string
      competence: string
      loginVersion: number
    }
  }
}