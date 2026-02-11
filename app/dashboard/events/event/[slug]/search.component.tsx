"use client";

import { useState, ChangeEvent, useEffect, useRef, KeyboardEvent } from 'react';
import { searchUserHandler } from './actions';
import { User } from '@/app/src/modules/db';

function UserSearchBar() {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const ignoreSearchRef = useRef(false);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    useEffect(() => {
        if (ignoreSearchRef.current) {
            ignoreSearchRef.current = false;
            return;
        }

        if (query.trim().length === 0) {
            setSuggestions([]);
            setIsOpen(false);
            setLoading(false);
            return;
        }

        setLoading(true);
        let active = true;

        const timeout = setTimeout(async () => {
            try {
                const searchData = await searchUserHandler(query);
                if (active) {
                    setSuggestions(searchData);
                    setIsOpen(true);
                    setHighlightedIndex(-1);
                }
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                if (active) setLoading(false);
            }
        }, 300);

        return () => {
            active = false;
            clearTimeout(timeout);
        };
    }, [query]);

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        setQuery(event.target.value);
        setIsOpen(true);
    }

    function handleSuggestionClick(suggestion: User) {
        ignoreSearchRef.current = true;
        setQuery(suggestion.username);
        setIsOpen(false);
        setSuggestions([]);
        setHighlightedIndex(-1);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (!isOpen) {
            if (event.key === "ArrowDown" && query.length > 0) {
                setIsOpen(true);
                setHighlightedIndex(0);
            }
            return;
        }

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                setHighlightedIndex(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                event.preventDefault();
                setHighlightedIndex(prev => 
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case "Enter":
                event.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
                    handleSuggestionClick(suggestions[highlightedIndex]);
                }
                break;
            case "Escape":
                setIsOpen(false);
                break;
        }
    }

    return (
        <div className="relative w-full max-w-sm mx-auto" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Nutzer suchen..."
                    name="name"
                    id="username"
                    autoComplete="off"
                    required
                    className="input p-2 my-2 h-10 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="loading loading-spinner loading-xs text-gray-400"></span>
                    </div>
                )}
            </div>
            {isOpen && (
                <ul className="absolute left-0 w-full mt-1 z-20 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                            <li 
                                key={suggestion.id} 
                                onClick={() => handleSuggestionClick(suggestion)} 
                                className={`px-4 py-2 cursor-pointer transition-colors duration-150 ${index === highlightedIndex ? "bg-green-100" : "hover:bg-green-50"}`}
                            >
                                <div className="font-medium text-gray-900">{suggestion.displayname}</div>
                                <div className="text-gray-500 text-sm">{suggestion.username + "・" + suggestion.group}</div>
                            </li>
                        ))
                    ) : (
                        !loading && <li className="px-4 py-2 text-gray-500 text-center">Keine Nutzer gefunden</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default UserSearchBar;
