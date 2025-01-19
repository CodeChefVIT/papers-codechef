"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { Search } from "lucide-react";
import debounce from "debounce";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

function SearchBar() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);

  const debouncedSearch = useCallback(
    debounce(async (text: string) => {
      if (text.length > 1) {
        setLoading(true);
        try {
          const searchResponse = await axios.get<{
            subjects: { subject: string }[];
          }>("/api/search", {
            params: { text },
          });

          const { subjects } = searchResponse.data;
          const suggestionList = subjects.map(
            (subjectObj: { subject: string }) => subjectObj.subject,
          );
          setSuggestions(suggestionList);
          setError(null);
        } catch (error) {
          const typedError = error as AxiosError<{ message?: string }>;
          const errorMessage =
            typedError.response?.data?.message ?? "Error fetching suggestions";
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 500),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (text.length <= 1) {
      setSuggestions([]);
    }
    setSearchText(text);
    void debouncedSearch(text);
  };

  const handleSelectSuggestion = async (suggestion: string) => {
    setSearchText(suggestion);
    setSuggestions([]);
    router.push(`/catalogue?subject=${encodeURIComponent(suggestion)}`);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      suggestionsRef.current &&
      !suggestionsRef.current.contains(event.target as Node)
    ) {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="mx-4 md:mx-0">
      <form className="w-full max-w-xl">
        <div className="relative">
          <Input
            type="text"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search by subject..."
            className={`text-md w-full rounded-full border bg-[#434dba] px-4 py-6 pr-10 font-sans tracking-wider text-white shadow-sm placeholder:text-white focus:outline-none focus:ring-2 ${loading ? "opacity-70" : ""}`}
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            disabled
          >
            {" "}
            <Search className="h-5 w-5 text-white " />
          </button>
          {loading && (
            <div className="text-md absolute z-20 mt-2 w-full max-w-xl rounded-md border border-[#434dba] bg-white p-2 text-center font-sans font-semibold tracking-wider dark:bg-[#030712]">
              Loading suggestions...
            </div>
          )}
          {(suggestions.length > 0 || error) && !loading && (
            <ul
              ref={suggestionsRef}
              className="absolute z-20 mx-0.5 mt-2 w-full max-w-xl rounded-md border border-[#434dba] bg-white text-center dark:bg-[#030712] md:mx-0"
            >
              {error ? (
                <li className="text-red p-2">{error}</li>
              ) : (
                suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="cursor-pointer truncate p-2 hover:opacity-50"
                    style={{
                      width: "100%",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {suggestion}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </form>
    </div>
  );
}

export default SearchBar;
