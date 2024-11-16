import { useState, useCallback, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import debounce from "debounce";
import { Input } from "@/components/ui/input";
import { courses } from "./select_options";

function SearchbarSubjectList({
  setSubject,
  resetSearch,
}: {
  setSubject: React.Dispatch<React.SetStateAction<string>>;
  resetSearch: boolean;
}) {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);

  const debouncedSearch = useCallback(
    debounce(async (text: string) => {
      if (text.length > 0) {
        setLoading(true);
        const escapedSearchText = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const regex = new RegExp(escapedSearchText, "i");
        const filteredSubjects = courses
          .filter((subject) => subject.search(regex) !== -1)
          .slice(0, 10);

        if (filteredSubjects.length === 0) {
          setError("Subject not found");
          setSuggestions([]);
          return;
        }
        setSuggestions(filteredSubjects);
        setError(null);
        setLoading(false);
      } else {
        setSuggestions([]);
      }
    }, 500),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);
    if (text.length <= 0) {
      setSuggestions([]);
    }
    void debouncedSearch(text);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchText(suggestion);
    setSuggestions([]);
    setSubject(suggestion);
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

  useEffect(() => {
    if (resetSearch) {
      setSearchText("");
      setSuggestions([]);
    }
  }, [resetSearch]);

  return (
    <div className="mx-4 md:mx-0">
      <form className=" my-2 ml-2 w-full max-w-xl">
        <div className="relative">
          <Input
            type="text"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search for subject..."
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            disabled
          >
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

export default SearchbarSubjectList;