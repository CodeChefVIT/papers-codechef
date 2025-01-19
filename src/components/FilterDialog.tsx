import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type Filters } from "@/interface";
import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

export const FilterDialog = ({
  subject,
  filterOptions,
  initialExams,
  initialSlots,
  initialYears,
  initialCampuses,
  initialSemesters,
  onReset,
  onApplyFilters,
}: {
  subject: string;
  filterOptions: Filters;
  initialExams: string[] | undefined;
  initialSlots: string[] | undefined;
  initialYears: string[] | undefined;
  initialCampuses: string [] | undefined
  initialSemesters: string [] | undefined

  onReset: () => void;
  onApplyFilters: (exams: string[], slots: string[], years: string[]) => void;
}) => {
  const [selectedExams, setSelectedExams] = useState<string[]>(
    initialExams ?? [],
  );
  const [selectedSlots, setSelectedSlots] = useState<string[]>(
    initialSlots ?? [],
  );
  const [selectedYears, setSelectedYears] = useState<string[]>(
    initialYears ?? [],
  );
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>(
    initialYears ?? [],
  );
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>(
    initialYears ?? [],
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSelectedExams(initialExams ?? []);
    setSelectedSlots(initialSlots ?? []);
    setSelectedYears(initialYears ?? []);
    setSelectedCampuses(initialCampuses ?? []);
    setSelectedSemesters(initialSemesters ?? [])
  }, [initialExams, initialSlots, initialYears]);

  const exams = filterOptions.uniqueExams.map((exam) => ({
    label: exam,
    value: exam,
  }));
  const slots = filterOptions.uniqueSlots.map((slot) => ({
  label: slot,
    value: slot,
  }));
  const years = filterOptions.uniqueYears.map((year) => ({
    label: year,
    value: year,
  }));
  const semesters = filterOptions.uniqueSemesters.map((semester) => ({
    label: semester,
    value: semester,
  }));
  const campuses = filterOptions.uniqueCampuses.map((campus) => ({
    label: campus,
    value: campus,
  }));
  const handleFilterClick = () => {
    onApplyFilters(selectedExams, selectedSlots, selectedYears);
    setOpen(false);
  };

  const handleResetClick = () => {
    setSelectedExams([]);
    setSelectedSlots([]);
    setSelectedYears([]);
    setSelectedSemesters([]);

    setSelectedCampuses([]);
    setOpen(false);
    onReset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl py-6">
          <span>
            <SlidersHorizontal />
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[650px] overflow-y-hidden">
        <DialogHeader>
          <DialogTitle>{subject}</DialogTitle>
        </DialogHeader>
        <div className="mx-4 my-6 flex flex-col space-y-6">
          <MultiSelect
            options={exams}
            onValueChange={setSelectedExams}
            placeholder="Exams"
            defaultValue={selectedExams}
          />
          <MultiSelect
            options={slots}
            onValueChange={setSelectedSlots}
            placeholder="Slots"
            defaultValue={selectedSlots}
          />
          <MultiSelect
            options={years}
            onValueChange={setSelectedYears}
            placeholder="Years"
            defaultValue={selectedYears}
          />
          <MultiSelect
            options={semesters}
            onValueChange={setSelectedSemesters}
            placeholder="Semesters"
            defaultValue={selectedSemesters}
          />
          {/* <MultiSelect
            options={campuses}
            onValueChange={setSelectedCampuses}
            placeholder="Campuses"
            defaultValue={selectedCampuses}
          /> */}
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleFilterClick}>
            Apply Filter
          </Button>
          <Button variant="outline" onClick={handleResetClick}>
            Reset Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
