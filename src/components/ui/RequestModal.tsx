"use client";

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowUpRight } from 'lucide-react'
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect, useMemo } from 'react';
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import toast from 'react-hot-toast';
import { exams, slots, years } from "@/components/select_options";
import Fuse from 'fuse.js';
import { useCourses } from "@/context/courseContext";

type Course = {
  name?: string | null;
  courseName?: string | null;
  title?: string | null;
};

const RequestModal = ({section = "navbar"} : {section? : string}) => {
    const [open, setOpen] = useState(false);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const suggestionsRef = useRef<HTMLUListElement | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedExam, setSelectedExam] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const { courses, loading, error, refetch } = useCourses();

    useEffect(() => {
        setSubjects(courses.map((course) => course.name));
    }, [courses]);


    const resetModal = () => {
        setSearchText("");
        setSelectedSubject(null);
        setSelectedExam(null);
        setSelectedSlot(null);
        setSelectedYear(null);
        setSuggestions([]);
    };


    const handleSelectSubject = (subject: string) => {
        setSelectedSubject(subject);
        setSearchText(subject);
        setSuggestions([]);
        setSelectedExam(null);
        setSelectedSlot(null);
        setSelectedYear(null);
    };

    const handleSubmit = async () => {
        if (!selectedSubject || !selectedExam || !selectedSlot || !selectedYear) {
        toast.error("Please fill all fields before submitting.");
        return;
        }

        try {
        await toast.promise(
            axios.post("/api/request", {
                subject: selectedSubject,
                exam: selectedExam,
                slot: selectedSlot,
                year: selectedYear,
            }),
            {
                loading: "Submitting your request...",
                success: "Your paper request was submitted successfully",
                error: "Failed to submit your request. Please try again later.",
            },
        );

        setOpen(false);
        } catch (error) {
        console.error("Error submitting request:", error);
        }
    };
    const fuse = useMemo(
        () => new Fuse(subjects, { includeScore: true, threshold: 0.3 }),
        [subjects],
    );

    useEffect(() => {
        if (!searchText.trim()) {
            setSuggestions([]);
            return;
        }
    
        if (selectedSubject && searchText === selectedSubject) {
            setSuggestions([]);
            return;
        }
        const results = fuse.search(searchText);
        setSuggestions(results.map((r) => r.item).slice(0, 10));
    }, [searchText, fuse, selectedSubject]);

    return (
    <Dialog 
    open={open} onOpenChange={(isOpen) => {
    setOpen(isOpen);
    if (isOpen) resetModal();
    }}>
        {section === "navbar" ?
        <DialogTrigger className='flex items-center gap-2'>
            <ArrowUpRight className="h-4 w-4"/>
            <span className="font-medium">Request Paper</span>
        </DialogTrigger> :
        <DialogTrigger className='underline text-[#562EE7] dark:text-[#A47DE5] '>
            <span className="font-medium">request a paper.</span>
        </DialogTrigger> 
        }
        <DialogContent className='bg-[#F3F5FF] dark:bg-[#070114] border-[#3A3745] items-start'>
            <DialogHeader>
                <DialogTitle>Request Papers</DialogTitle>
                <DialogDescription>
                    Having trouble finding a specific paper? Don&apos;t worry! Simply submit a request here, and our team will track it down, source it, and upload it for you so you can access it hassle-free.
                </DialogDescription>
            </DialogHeader>
            <div className="text-end">
                <div className="relative mx-auto mt-4 mb-8 max-w-xl font-play">
                    <Input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search by subject..."
                    className={`text-md rounded-lg bg-[#B2B8FF] px-4 py-6 pr-10 font-play tracking-wider text-black shadow-sm ring-0 placeholder:text-black focus:outline-none focus:ring-0 dark:bg-[#7480FF66] dark:text-white placeholder:dark:text-white ${suggestions.length > 0 ? "rounded-b-none" : ""}`}
                    />
                    <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                    <Search className="h-5 w-5 text-black dark:text-white" />{" "}
                    </button>
                    {suggestions.length > 0 && (
                    <ul
                        ref={suggestionsRef}
                        className="absolute z-20 max-h-[250px] w-full max-w-xl overflow-y-auto rounded-md rounded-t-none border border-t-0 bg-white text-center shadow-lg dark:bg-[#303771]"
                    >
                        {suggestions.map((s, idx) => (
                        <li
                            key={idx}
                            onClick={() => handleSelectSubject(s)}
                            className="cursor-pointer truncate p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            {s}
                        </li>
                        ))}
                    </ul>
                    )}
                </div>

                <div className="mb-8 flex justify-center gap-4 w-full">
                    <Select
                    onValueChange={setSelectedExam}
                    disabled={!selectedSubject}
                    value={selectedExam ?? undefined}
                    >
                        <SelectTrigger className="flex-1 dark:bg-black dark:text-white border-[#3A3745] bg-[#e8e9ff]">
                            <SelectValue placeholder="Exam" />
                        </SelectTrigger>
                        <SelectContent className='dark:bg-black dark:text-white border-[#3A3745] bg-[#e8e9ff]'>
                            {exams.map((exam) => (
                            <SelectItem key={exam} value={exam} className='cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1A1823]'>
                                {exam}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <Select
                        onValueChange={setSelectedSlot}
                        disabled={!selectedSubject}
                        value={selectedSlot ?? undefined}
                        >
                        <SelectTrigger className="flex-1 dark:bg-black dark:text-white border-[#3A3745] bg-[#e8e9ff]">
                            <SelectValue placeholder="Slot" />
                        </SelectTrigger>
                        <SelectContent className='dark:bg-black dark:text-white border-[#3A3745] bg-[#e8e9ff]'>
                            {slots.map((slot) => (
                            <SelectItem key={slot} value={slot} className='cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1A1823]'>
                                {slot}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <Select
                        onValueChange={setSelectedYear}
                        disabled={!selectedSubject}
                        value={selectedYear ?? undefined}
                        >
                        <SelectTrigger className="flex-1 dark:bg-black dark:text-white border-[#3A3745] bg-[#e8e9ff]">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className='dark:bg-black dark:text-white border-[#3A3745] bg-[#e8e9ff]'>
                            {[...years]
                            .sort((a, b) => Number(b) - Number(a))
                            .map((year) => (
                                <SelectItem key={year} value={year} className='cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1A1823]'>
                                {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    className="rounded-md px-8 py-3 hover:opacity-80 bg-[#B2B8FF] text-black dark:border-[#36266D] dark:bg-[#7480ff9d] dark:text-white"
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </div>
        </DialogContent>
    </Dialog>
    )
}

export default RequestModal