"use client";

import { useState, ChangeEvent } from 'react';
import { searchHandler } from './checkinHandler';
import { User } from '@prisma/client';

function UserSearchBar() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    async function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        setQuery(value);

        if (value.length > 0) {
            let searchData = await searchHandler(value)
            setSuggestions(searchData);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    function handleSuggestionClick(suggestion: User) {
        setQuery(suggestion.username);
        setSuggestions([]);
        setShowSuggestions(false);
    };
    return (
        <div className="relative w-full max-w-sm mx-auto">
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Nutzer suchen..."
                name="name"
                id="username"
                autoComplete="off"
                required
                className="rounded-full p-2 mx-4 my-2 border-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
            {showSuggestions && (
                <ul className="absolute left-0 w-full mt-1 z-10 bg-white border rounded-md shadow-lg">
                    {suggestions.length > 0 ? (
                        suggestions.map((suggestion) => (
                            <li key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)} className="px-4 py-2 cursor-pointer hover:rounded-md hover:bg-green-600 hover:text-white">
                                {suggestion.displayname}
                                <p className="text-gray-600 text-sm">{suggestion.username + "・" + suggestion.group}</p>
                            </li>
                        ))
                    ) : (<li className="px-4 py-2 text-gray-500">Keine Nutzer gefunden</li>)}
                </ul>)}
        </div>
    );
};

export default UserSearchBar;
