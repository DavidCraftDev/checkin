'use client'

import { SearchParams } from "@/app/src/interfaces/searchParams"
import { redirect } from "next/navigation"

const checkin = (searchParams: SearchParams) => {
    redirect("/dashboard/events/event?id=" + searchParams.id + "&checkin=true")
  }

const CheckINButton = ({searchParams}: {searchParams: SearchParams}) => {
    return (
        <form action={() => checkin(searchParams)}>
          <button className="btn">
            Nutzer hinzufügen
          </button>
      </form>
    )
}

export default CheckINButton;