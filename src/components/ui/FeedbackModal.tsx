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
import { MessageSquare } from 'lucide-react'
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import axios from 'axios';
import toast from 'react-hot-toast';

const FeedbackModal = ({section = "navbar"} : {section? : string}) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");

    const resetModal = () => {
        setMessage("");
        setEmail("");
    };

    const handleSubmit = async () => {
        if (!message.trim()) {
            toast.error("Please enter your feedback before submitting.");
            return;
        }

        try {
            await toast.promise(
                axios.post("/api/feedback", {
                    message: message.trim(),
                    email: email.trim() || undefined,
                }),
                {
                    loading: "Submitting your feedback...",
                    success: "Thanks for your feedback!",
                    error: "Failed to submit your feedback. Please try again later.",
                },
            );

            setOpen(false);
        } catch (error) {
            console.error("Error submitting feedback:", error);
        }
    };

    return (
    <Dialog
    open={open} onOpenChange={(isOpen) => {
    setOpen(isOpen);
    if (isOpen) resetModal();
    }}>
        {section === "navbar" ?
        <DialogTrigger className="flex w-full items-center gap-2.5 bg-transparent hover:bg-transparent focus:bg-transparent text-left cursor-pointer border-0 shadow-none outline-none">
            <MessageSquare className="h-4 w-4"/>
            <span className="text-xs font-medium">Feedback</span>
        </DialogTrigger> :
        <DialogTrigger className='underline text-[#562EE7] dark:text-[#A47DE5] '>
            <span className="font-medium">give feedback.</span>
        </DialogTrigger>
        }
        <DialogContent className='bg-[#F3F5FF] dark:bg-[#070114] border-[#3A3745] items-start'>
            <DialogHeader>
                <DialogTitle>Share Feedback</DialogTitle>
                <DialogDescription>
                    Spotted a bug or have an idea to make this better? Let us know below — it only takes a few seconds.
                </DialogDescription>
            </DialogHeader>
            <div className="w-full text-end">
                <div className="mx-auto mb-4 max-w-xl font-play">
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="What's on your mind?"
                        rows={4}
                        className="text-md rounded-2xl bg-[#B2B8FF] px-4 py-3 font-play tracking-wider text-black shadow-sm ring-0 placeholder:text-black focus:outline-none focus:ring-0 dark:bg-[#7480FF66] dark:text-white placeholder:dark:text-white"
                    />
                </div>

                <div className="mx-auto mb-8 max-w-xl font-play">
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email (optional, if you'd like a reply)"
                        className="text-md rounded-2xl bg-[#B2B8FF] px-4 py-6 font-play tracking-wider text-black shadow-sm ring-0 placeholder:text-black focus:outline-none focus:ring-0 dark:bg-[#7480FF66] dark:text-white placeholder:dark:text-white"
                    />
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

export default FeedbackModal
