"use client";

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import PinButton from "../PinButton";
import Fuse from "fuse.js";
import { type StoredSubjects, type ICourseWithCount, type IUpcomingPaper } from "@/interface";

function PinnedSearchBar({
  initialSubjects,
  setDisplayPapers,
  displayPapers,
  filtersNotPulled,
}: {
  initialSubjects: ICourseWithCount[];
  setDisplayPapers: React.Dispatch<React.SetStateAction<IUpcomingPaper[]>>; 
  displayPapers : IUpcomingPaper[];
  filtersNotPulled?: () => void;
}) {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);
  const [pinned, setPinned] = useState<boolean>(false);
  const [showControls, setShowControls] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const [fuzzy, setFuzzy] = useState(
    () => new Fuse<ICourseWithCount>([], { keys: ["name"], threshold: 0.3 }),
  );
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  useEffect(() => {
    if (initialSubjects && initialSubjects.length > 0) {
      setFuzzy(new Fuse(initialSubjects, { keys: ["name"], threshold: 0.3 }));
    }
  }, [initialSubjects]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);

    if (text.length > 1 && initialSubjects.length > 0) {
      const filteredSuggestions = fuzzy
        .search(text)
        .sort((a, b) => (a.score ?? Infinity) - (b.score ?? Infinity))
        .map((res) => res.item.name)
        .slice(0, 10);

      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchText(suggestion);

    const currentPinnedSubjects = JSON.parse(
      localStorage.getItem("userSubjects") ?? "[]",
    ) as StoredSubjects;

    if (suggestion && Array.isArray(currentPinnedSubjects)) {
      setPinned(currentPinnedSubjects.includes(suggestion));
    }

    setTimeout(() => {
      searchRef.current?.focus();
    }, 0);

    setShowControls(true);
    setSuggestions([]);
    filtersNotPulled?.();
  };


  useEffect(() => {
    const handleAddClicked = () => {
      searchRef.current?.focus();
    };

    window.addEventListener("addButtonClicked", handleAddClicked);

    return () => {
      window.removeEventListener("addButtonClicked", handleAddClicked);
    };
  }, []);

  const handlePinToggle = (searchTextOverride? : string) => {
    const current = !pinned;
    setPinned(current);
    const subject : string = (searchTextOverride ?? searchText).toString().trim();
    if (
      subject.trim() === "" ||
      !initialSubjects.find((s) => s.name === subject)
    ) {
      return;
    }

    const saved = JSON.parse(
      localStorage.getItem("userSubjects") ?? "[]",
    ) as string[];

    let updated: string[] = [];

    if (saved.includes(subject)) {
      updated = saved.filter((s) => s !== subject);
      setPinned(false);
    } else {
      updated = [...new Set([...saved, subject])];
      setPinned(true);
    }
    

    if (updated.length === 0) {
      setShowControls(false);
    } else {
      setShowControls(true);
    }

    localStorage.setItem("userSubjects", JSON.stringify(updated));

    setDisplayPapers((prev) => {
      const isAlreadyPinned = prev.find((paper) => paper.subject === subject);
      if (!isAlreadyPinned) {
        return [...prev, { subject, slots: [] }];
      } else {
        return prev.filter((paper) => paper.subject !== subject);
      }
    });

    setSearchText("");
    setPinned(false);
    setHighlightedIndex(-1);
  };

  useEffect(() => {
    const handlePinsChange = () => {
      const saved = JSON.parse(
        localStorage.getItem("userSubjects") ?? "[]",
      ) as string[];

      if (saved.length === 0) {
        setShowControls(false);
      } else {
        setShowControls(true);
      }
    };

    window.addEventListener("userSubjectsChanged", handlePinsChange);

    return () => {
      window.removeEventListener("userSubjectsChanged", handlePinsChange);
    };
  }, []);

  const handleRemoveAll = () => {
    localStorage.setItem("userSubjects", JSON.stringify([]));
    window.dispatchEvent(new Event("userSubjectsChanged"));
  };

  useEffect(() => {
    const storedSubjects = JSON.parse(
      localStorage.getItem("userSubjects") ?? "[]",
    ) as string[];

    if (storedSubjects.length > 0) {
      setShowControls(true);
    }
  }, []);

  return (
    <div className="w-full font-play">
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePinToggle();
            }}
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={searchText}
                  ref={searchRef}
                  onChange={handleSearchChange}
                  placeholder="Search subject to pin..."
                  className={`text-md w-full rounded-lg bg-[#B2B8FF] px-4 py-6 pr-10 font-play tracking-wider text-black shadow-sm ring-0 placeholder:text-black focus:outline-none focus:ring-0 dark:bg-[#7480FF66] dark:text-white placeholder:dark:text-white ${
                    suggestions.length > 0 ? "rounded-b-none" : ""
                  }`}
                  onKeyDown={(e) => {
                    if(suggestions.length == 0 && searchText.trim() == "") return;
                    if(e.key == 'ArrowDown'){
                      e.preventDefault();
                      setHighlightedIndex((curr) => (curr + 1) % suggestions.length);
                    }
                    else if(e.key == 'ArrowUp'){
                      e.preventDefault();
                      setHighlightedIndex((curr) => (curr - 1 + suggestions.length) % suggestions.length);
                    }
                    else if(e.key == 'Enter'){
                      e.preventDefault();
                      if(suggestions.length > 0 && highlightedIndex >=0 && suggestions[highlightedIndex] != undefined){
                        handlePinToggle(suggestions[highlightedIndex]);
                        setSuggestions([]);
                      }
                    }
                  }}
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <Search className="h-5 w-5 text-black dark:text-white" />
                </div>

                {suggestions.length > 0 && (
                  <ul
                    ref={suggestionsRef}
                    className={`absolute z-20 w-full max-w-xl overflow-y-scroll rounded-md rounded-t-none border border-t-0 bg-white text-center shadow-lg dark:bg-[#303771] md:mx-0 ${
                      suggestions.length > 6 ? "h-[250px]" : "h-auto"
                    } ${suggestions.length > 10 ? "md:h-[400px]" : "md:h-auto"}`}
                  >
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className={`flex cursor-pointer items-center rounded p-2 
                        ${index === highlightedIndex
                          ? "bg-gray-200 dark:bg-gray-800"
                          : "hover:bg-gray-200 dark:hover:bg-gray-800"}`}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <PinButton
                isPinned={pinned}
                onToggle={handlePinToggle}
                disabled={!showControls || searchText.trim() === ""}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PinnedSearchBar;
