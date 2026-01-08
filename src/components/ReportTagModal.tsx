"use client";

import React, { useState, useEffect, useMemo } from "react";
import { FaFlag } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/multi-select";
import LabeledInput from "@/components/ui/LabeledInput";
import LabeledSelect from "@/components/ui/LabeledSelect";
import axios from "axios";
import toast from "react-hot-toast";

interface ReportTagModalProps {
  paperId: string;
  subject?: string;
  exam?: string;
  slot?: string;
  year?: string;
  toolbarStyle?: boolean;
  open?: boolean;
  setOpen?: (v: boolean) => void;
}

const ReportTagModal = ({
  paperId,
  subject,
  exam,
  slot,
  year,
  open,
  setOpen,
}: ReportTagModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined && setOpen !== undefined;

  const modalOpen = isControlled ? open : internalOpen;
  const modalSetOpen = isControlled ? setOpen : setInternalOpen;

  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryValues, setCategoryValues] = useState<Record<string, string>>(
    {},
  );
  const [originalCategoryValues, setOriginalCategoryValues] = useState<
    Record<string, string>
  >({});
  const [originalEmail, setOriginalEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const SCROLL_THRESHOLD = 4;
  const contentClass = `bg-[#F3F5FF] dark:bg-[#070114] border-[#3A3745] items-start sm:max-w-3xl w-full ${
    selectedCategories.length > SCROLL_THRESHOLD
      ? "max-h-[70vh] overflow-y-auto"
      : ""
  }`;

  const isDirty = useMemo(() => {
    if (selectedCategories.length === 0) return false;
    for (const c of selectedCategories) {
      const curr = (categoryValues[c] ?? "").trim();
      const orig = (originalCategoryValues[c] ?? "").trim();
      if (curr !== orig) return true;
    }

    if (selectedCategories.includes("subject")) {
      const currCode = (categoryValues.courseCode ?? "").trim();
      const origCode = (originalCategoryValues.courseCode ?? "").trim();
      if (currCode !== origCode) return true;
    }

    return false;
  }, [selectedCategories, categoryValues, originalCategoryValues]);
  const canSubmit = isDirty ?? comment.trim().length > 0;

  useEffect(() => {
    for (const c of selectedCategories) {
      if (categoryValues[c]) continue;
      if (c === "subject" && subject) {
        const regex = /^(.*)\s*\[([^\]]+)\]\s*$/;
        const m = regex.exec(subject);
        if (m?.[1] && m?.[2]) {
          const name = m[1].trim();
          const code = m[2].trim();
          setCategoryValues((s) => ({ ...s, subject: name, courseCode: code }));
        } else {
          setCategoryValues((s) => ({ ...s, subject }));
        }
      } else if (c === "exam" && exam)
        setCategoryValues((s) => ({ ...s, [c]: exam }));
      else if (c === "slot" && slot)
        setCategoryValues((s) => ({ ...s, [c]: slot }));
      else if (c === "year" && year)
        setCategoryValues((s) => ({ ...s, [c]: year }));
    }
  }, [selectedCategories, subject, exam, slot, year]);

  useEffect(() => {
    if (open) {
      const base: Record<string, string> = {};
      if (subject) {
        const regex = /^(.*)\s*\[([^\]]+)\]\s*$/;
        const m = regex.exec(subject);

        if (m?.[1] && m?.[2]) {
          base.subject = m[1].trim();
          base.courseCode = m[2].trim();
        } else {
          base.subject = subject;
        }
      }

      if (exam) base.exam = exam;
      if (slot) base.slot = slot;
      if (year) base.year = year;
      setOriginalCategoryValues(base);
      setOriginalEmail("");
    } else {
      setSelectedCategories([]);
      setCategoryValues({});
      setComment("");
      setEmail("");
      setOriginalCategoryValues({});
      setOriginalEmail("");
    }
  }, [open, subject, exam, slot, year]);

  const handleSubmit = async () => {
    if (!paperId) {
      toast.error("Missing paper id.");
      return;
    }

    if (selectedCategories.includes("subject")) {
      const sub = (categoryValues.subject ?? "").trim();
      if (!sub) {
        toast.error("Subject name cannot be empty.");
        return;
      }
    }

    if (selectedCategories.includes("slot")) {
      const v = (categoryValues.slot ?? "").trim();
      const slotRegex = /^[A-G][1-2]$/;
      if (!slotRegex.test(v)) {
        toast.error("Slot must be from A1 to G2 (e.g., D1, B2).");
        return;
      }
    }
    if (selectedCategories.includes("year")) {
      const y = (categoryValues.year ?? "").trim();
      const yearRegex = /^\d{4}(-\d{4})?$/;
      if (!yearRegex.test(y)) {
        toast.error("Year must be a valid format (e.g., 2024 or 2024-2025).");
        return;
      }
      if (y.includes("-")) {
        const parts = y.split("-");
        const start = Number(parts[0]);
        const end = Number(parts[1]);

        if (isNaN(start) ?? isNaN(end)) {
          toast.error("Invalid year format.");
          return;
        }
        if (end - start !== 1) {
          toast.error(
            "Year range difference must be exactly 1 (e.g., 2024-2025).",
          );
          return;
        }
      }
    }
    if (email.trim() && !email.includes("@gmail.com")) {
      toast.error("Email must be a valid Gmail address (@gmail.com).");
      return;
    }

    const reportedFields: { field: string; value?: string }[] = [];

    for (const c of selectedCategories) {
      if (c === "subject") {
        const newSub = (categoryValues.subject ?? "").trim();
        const oldSub = (originalCategoryValues.subject ?? "").trim();

        if (newSub !== oldSub) {
          reportedFields.push({ field: "subject", value: newSub });
        }

        const newCode = (categoryValues.courseCode ?? "").trim();
        const oldCode = (originalCategoryValues.courseCode ?? "").trim();

        if (newCode !== oldCode) {
          reportedFields.push({ field: "courseCode", value: newCode });
        }

        continue;
      }

      const newVal = (categoryValues[c] ?? "").trim();
      const oldVal = (originalCategoryValues[c] ?? "").trim();

      if (newVal !== oldVal) {
        reportedFields.push({ field: c, value: newVal });
      }
    }

    if (reportedFields.length === 0 && comment.trim().length === 0) {
      toast.error("Please change a tag or write a comment.");
      return;
    }
    const payload = {
      paperId,
      reportedFields,
      comment,
      reporterEmail: email ?? undefined,
    };
    setLoading(true);
    await toast
      .promise(axios.post("/api/report-tag", payload), {
        loading: "submitting your report...",
        success: "reported successfully",
        error: (err: unknown) => {
          if (axios.isAxiosError(err)) {
            return (
              (err.response?.data as { error?: string })?.error ??
              err.message ??
              "failed to submit report"
            );
          }

          if (err instanceof Error) {
            return err.message;
          }

          return "failed to submit report";
        },
      })
      .then(() => {
        modalSetOpen(false);
        setComment("");
        setEmail("");
        setSelectedCategories([]);
        setCategoryValues({});
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog open={modalOpen} onOpenChange={modalSetOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <button className="rounded-full border border-red-300 p-2 text-red-500 transition hover:border-red-500 hover:text-red-600 hover:shadow-[0_0_8px_rgba(255,0,0,0.4)]">
            <FaFlag className="text-sm" />
          </button>
        </DialogTrigger>
      )}

      <DialogContent className={contentClass}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Report Wrong Tags</DialogTitle>
            <FaFlag className="text-lg" aria-hidden="true" />
          </div>
          <DialogDescription>
            Help us improve tagging — suggest correct tags and add an optional
            comment.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 w-full space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Which fields are wrong? (select one or more)
            </label>
            <MultiSelect
              options={[
                { label: "Subject", value: "subject" },
                { label: "Exam", value: "exam" },
                { label: "Slot", value: "slot" },
                { label: "Year", value: "year" },
              ]}
              onValueChange={(vals: string[]) => setSelectedCategories(vals)}
              defaultValue={[]}
              placeholder="Select fields"
            />
          </div>

          {selectedCategories.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Correct values
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {selectedCategories.map((c) => {
                  if (c === "subject") {
                    return (
                      <div key={c} className="w-full space-y-2">
                        <LabeledInput
                          label="Subject name"
                          value={categoryValues.subject ?? ""}
                          onChange={(v) =>
                            setCategoryValues((s) => ({ ...s, subject: v }))
                          }
                          placeholder="Subject name"
                        />
                        <LabeledInput
                          label="Course code"
                          value={categoryValues.courseCode ?? ""}
                          onChange={(v) =>
                            setCategoryValues((s) => ({ ...s, courseCode: v }))
                          }
                          placeholder="e.g. BMAT205L"
                        />
                      </div>
                    );
                  }

                  if (c === "exam") {
                    return (
                      <LabeledSelect
                        key={c}
                        label="Exam"
                        value={categoryValues.exam ?? ""}
                        onChange={(v) =>
                          setCategoryValues((s) => ({ ...s, exam: v }))
                        }
                        options={["CAT-1", "CAT-2", "FAT"]}
                        placeholder="Select exam"
                      />
                    );
                  }

                  if (c === "slot") {
                    return (
                      <LabeledInput
                        key={c}
                        label="Slot"
                        value={categoryValues.slot ?? ""}
                        onChange={(v) =>
                          setCategoryValues((s) => ({
                            ...s,
                            slot: v.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                          }))
                        }
                        placeholder="e.g. D1"
                        maxLength={2}
                      />
                    );
                  }

                  if (c === "year") {
                    return (
                      <LabeledInput
                        key={c}
                        label="Year"
                        value={categoryValues.year ?? ""}
                        onChange={(v) =>
                          setCategoryValues((s) => ({ ...s, year: v }))
                        }
                        placeholder="e.g. 2024-2025"
                      />
                    );
                  }

                  return (
                    <LabeledInput
                      key={c}
                      label={c}
                      value={categoryValues[c] ?? ""}
                      onChange={(v) =>
                        setCategoryValues((s) => ({ ...s, [c]: v }))
                      }
                    />
                  );
                })}
              </div>
            </div>
          )}

          <LabeledInput
            label="Comment (optional)"
            value={comment}
            onChange={setComment}
            placeholder="Describe the issue clearly (e.g., pages torn, print faded, incorrect paper, missing sections)"
          />

          <LabeledInput
            label="Your email (optional)"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            type="email"
          />
          {!canSubmit && (
            <p className="text-xs text-gray-500 dark:text-red-400">
              Submit button becomes active only if you update a tag or write a
              comment.
            </p>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportTagModal;
