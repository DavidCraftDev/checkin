'use client'

import { submitHandler } from "./page";

const UsernameForm = () => {
    return (
        <form action={submitHandler}>
        <div>
            <label htmlFor="usernameName">Username</label><br />
            <input type="text" name="name" id="usernameName" className="rounded-full p-2 m-4 border-2 border-black-600" />
        </div>
        <button type="submit" className="bg-green-600 text-white p-2 rounded-full">Finden</button>
        </form>
    )
}

export default UsernameForm;