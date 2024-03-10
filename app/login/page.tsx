import {
    LoginButton,
    LogoutButton,
    ProfileButton,
    RegisterButton,
  } from "@/app/login/buttons.component";
  
  export default function Login() {
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
        </div>
      </main>
    );
  }
  