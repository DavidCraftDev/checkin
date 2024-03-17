'use client'

import { redirect } from "next/navigation"

const createEvent = () => {
    redirect("/dashboard/events/createEvent")
  }

const CreatEventButton = () => {
    return (
        <form action={createEvent}>
          <button className="bg-black text-white p-5 mb-5 rounded-lg">
            Neue Veranstaltung erstellen
          </button>
      </form>
    )
}

export default CreatEventButton;