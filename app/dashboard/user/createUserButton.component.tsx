'use client'

import { useRouter } from "next/navigation"
import { FormEvent } from "react";

function CreateUserButton() {
  const router = useRouter();
  function createUserRedirect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/dashboard/user/create")
  }
  return (
    <form onSubmit={createUserRedirect} className="place-self-center">
      <button type="submit" className="btn">
        Nutzer erstellen
      </button>
    </form>
  )
}

export default CreateUserButton;