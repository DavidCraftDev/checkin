'use client'

import { redirect } from "next/navigation"

const createEvent = () => {
    redirect("/dashboard/events/createdEvents?create=true")
  }

const CreatEventButton = () => {
    return (
        <form action={createEvent}>
          <button className="btn">
            Neue Veranstaltung erstellen
          </button>
      </form>
    )
}

export default CreatEventButton;