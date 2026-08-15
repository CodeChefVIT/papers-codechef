import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortOption = "asc" | "desc" | "none";

interface SortComponentProps {
  onSortChange: (sortOption: SortOption) => void;
  currentSort: SortOption;
}

const SortComponent: React.FC<SortComponentProps> = ({
  onSortChange,
  currentSort,
}) => {
  const handleSortChange = (option: SortOption) => {
    onSortChange(option);
  };

  const getSortIcon = () => {
    if (currentSort === "asc") return <ArrowUp className="h-4 w-4" />;
    if (currentSort === "desc") return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const getSortLabel = () => {
    if (currentSort === "asc") return "Year (Old to New)";
    if (currentSort === "desc") return "Year (New to Old)";
    return "Sort by Year";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex h-10 gap-2 rounded-xl border-2 border-[#6536c1] bg-white/70 font-sans font-semibold text-[#6536c1] transition-colors hover:bg-[#6536c1]/10 hover:text-[#6536c1] dark:border-[#8b6cff] dark:bg-[#070114] dark:text-[#a98cff] dark:hover:border-[#a98cff] dark:hover:bg-[#6536c1]/20"
        >
          {getSortIcon()}
          <span className="hidden sm:inline">{getSortLabel()}</span>
          <span className="sm:hidden">Sort</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 border-2 border-black bg-white dark:border-[#434dba] dark:bg-[#0a0118]"
      >
        <DropdownMenuItem
          onClick={() => handleSortChange("desc")}
          className={`cursor-pointer font-semibold ${
            currentSort === "desc" ? "bg-violet-100 dark:bg-violet-900/30" : ""
          }`}
        >
          <ArrowDown className="mr-2 h-4 w-4" />
          Year (New to Old)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSortChange("asc")}
          className={`cursor-pointer font-semibold ${
            currentSort === "asc" ? "bg-violet-100 dark:bg-violet-900/30" : ""
          }`}
        >
          <ArrowUp className="mr-2 h-4 w-4" />
          Year (Old to New)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSortChange("none")}
          className={`cursor-pointer font-semibold ${
            currentSort === "none" ? "bg-violet-100 dark:bg-violet-900/30" : ""
          }`}
        >
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Default Order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortComponent;
