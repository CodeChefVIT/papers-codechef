"use client";

import React from "react";
import { Field } from "@/components/ui/field";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";

interface LabeledSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}

const LabeledSelect = ({ label, value, onChange, options, placeholder }: LabeledSelectProps) => {
  return (
    <Field label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder || "Select"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
};

export default LabeledSelect;
