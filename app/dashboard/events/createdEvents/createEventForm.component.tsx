import submitHandler from "./submitHandler";

async function CreateEventForm() {
    return (
        <form action={submitHandler}>
            <div>
                <label htmlFor="eventName">Veranstaltungsname</label><br />
                <input type="text" name="name" id="eventName" className="rounded-full p-2 my-2 border-2 border-black-600 ring-0 ring-black-600 focus:outline-none focus:ring-1" />
            </div>
            <button type="submit" className="btn">Veranstaltung Erstellen</button>
        </form>
    )
}

export default CreateEventForm;