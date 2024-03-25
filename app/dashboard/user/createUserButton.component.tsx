'use client'

import { redirect } from "next/navigation"

const checkin = () => {
    redirect("/dashboard/user/create")
  }

const CreateUserButton = () => {
    return (
        <form action={checkin} className="place-self-center">
          <button className="btn">
            Nutzer erstellen
          </button>
      </form>
    )
}

export default CreateUserButton;