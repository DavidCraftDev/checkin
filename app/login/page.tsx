import {
  LoginButton,
  LogoutButton,
  ProfileButton,
  RegisterButton,
} from "@/app/login/buttons.component";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/src/modules/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "70vh",
      }}
    >
      <div>
        <LoginButton />
        <RegisterButton />
        <LogoutButton />
        <ProfileButton />

        <h1>Server Session</h1>
        <pre>{JSON.stringify(session)}</pre>
      </div>
    </main>
  );
}
