"use client";

import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SearchBar from "@/components/Searchbar/searchbar";
import { type IUpcomingPaper } from "@/interface";
import { type StoredSubjects } from "@/interface";
import { useState, useEffect } from "react";
import { Pin, PinOff, Plus, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableItem = ({
  id,
  subject,
  onUnpin,
}: {
  id: string;
  subject: string;
  onUnpin: (subject: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`mb-2 flex items-center justify-between rounded-md border border-[#3A3745] px-4 py-2 pl-2 shadow-sm ${
        isDragging ? "scale-[1.02] cursor-grabbing opacity-90" : "cursor-grab"
      }`}
    >
      <div
        {...listeners}
        className="mr-2 flex h-full items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <GripVertical size={16} />
      </div>
      <span className="flex-1 text-sm font-medium">{subject}</span>
      <button
        onClick={() => onUnpin(subject)}
        className="text-red-700 hover:text-red-600 dark:text-red-600 dark:hover:text-red-500"
      >
        <div className="flex items-center gap-2 text-sm">
          Unpin
          <PinOff size={16} />
        </div>
      </button>
    </div>
  );
};

const PinnedModal = ({
  triggerName = "Pin Subjects",
  page = "Navbar",
}: {
  triggerName?: string;
  page?: string;
}) => {
  const [displayPapers, setDisplayPapers] = useState<IUpcomingPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  const fetchPapers = async () => {
    try {
      setIsLoading(true);
      const storedSubjects = JSON.parse(
        localStorage.getItem("userSubjects") ?? "[]",
      ) as StoredSubjects;
      const response = await axios.post<{ subject: string; slots: string[] }[]>(
        "/api/user-papers",
        storedSubjects,
      );
      const fetchedPapers = response.data;
      const fetchedSubjectsSet = new Set(
        fetchedPapers.map((paper) => paper.subject),
      );
      const storedSubjectsArray = Array.isArray(storedSubjects)
        ? storedSubjects
        : [];
      const missingSubjects = storedSubjectsArray
        .filter((subject: string) => !fetchedSubjectsSet.has(subject))
        .map((subject: string) => ({ subject, slots: [] })) as {
        subject: string;
        slots: string[];
      }[];
      const allDisplayPapers = [...fetchedPapers, ...missingSubjects];

      allDisplayPapers.sort((a, b) => {
        const aIndex = storedSubjects.indexOf(a.subject);
        const bIndex = storedSubjects.indexOf(b.subject);

        return (
          (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
          (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex)
        );
      });

      setDisplayPapers(allDisplayPapers);
    } catch (error) {
      console.error("Failed to fetch papers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const unpinSubject = (subjectToRemove: string) => {
    const updatedSubjects = (
      JSON.parse(localStorage.getItem("userSubjects") ?? "[]") as string[]
    ).filter((subj) => subj !== subjectToRemove);
    localStorage.setItem("userSubjects", JSON.stringify(updatedSubjects));
    setDisplayPapers((prev) =>
      prev.filter((paper) => paper.subject !== subjectToRemove),
    );
    window.dispatchEvent(new Event("userSubjectsChanged"));
    window.dispatchEvent(new Event("updatePapers"));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDisplayPapers((items) => {
        const oldIndex = items.findIndex((i) => i.subject === active.id);
        const newIndex = items.findIndex((i) => i.subject === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem(
          "userSubjects",
          JSON.stringify(newOrder.map((p) => p.subject)),
        );
        return newOrder;
      });
    }
  };

  useEffect(() => {
    void fetchPapers();
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          void fetchPapers();
        } else {
          window.dispatchEvent(new Event("userSubjectsChanged"));
          window.dispatchEvent(new Event("updatePapers"));
        }
      }}
    >
      {page === "Navbar" ? (
        <DialogTrigger className="flex h-full w-full flex-row items-center gap-2">
          <Pin size={16} />
          {triggerName}
        </DialogTrigger>
      ) : (
        <DialogTrigger className="flex h-full w-full flex-row items-center justify-center gap-2">
          <Plus className="font-extrabold" />
          {triggerName}
        </DialogTrigger>
      )}
      <DialogContent className="border-[#3A3745] bg-[#F3F5FF] dark:bg-[#070114]">
        <DialogHeader>
          <DialogTitle>
            Quick Access to This Semester&apos;s Subjects
          </DialogTitle>
          <DialogTitle className="font-normal">
            <div className="my-3 flex w-full flex-col items-center gap-2 text-sm">
              <div className="w-full">
                <SearchBar
                  type="pinned"
                  setDisplayPapers={setDisplayPapers}
                  displayPapers={displayPapers}
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-64 w-full overflow-y-auto rounded-md border border-[#3A3745] p-2">
                {displayPapers.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={displayPapers.map((p) => p.subject)}
                      strategy={verticalListSortingStrategy}
                    >
                      {displayPapers.map((item) => (
                        <SortableItem
                          key={item.subject}
                          id={item.subject}
                          subject={item.subject}
                          onUnpin={unpinSubject}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                ) : (
                  <p className="mt-2 items-center justify-center text-center text-sm text-gray-500">
                    Start pinning subjects for quick and easy access.
                  </p>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default PinnedModal;
