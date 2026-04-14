"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SidebarButton from "./SidebarButton";

interface SidebarSectionProps {
  label: string;
  data: { label: string; value: string }[];
  selected: string[];
  updater: (newVal: string[]) => void;

  openItem: string | undefined;
  setOpenItem: (val: string | undefined) => void;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({
  label,
  data,
  selected,
  updater,
  openItem,
  setOpenItem,
}) => {
  return (
    <div className="flex w-full flex-col items-baseline justify-between border-b-2 border-[#36266d] px-[10px]">
      <Accordion
        className="w-full"
        type="single"
        collapsible
        value={openItem}
        onValueChange={setOpenItem}
      >
        <AccordionItem
          className="border-none"
          value={label} // ✅ IMPORTANT: stable value
        >
          <AccordionTrigger className="w-full">
            <div className="font-play text-sm">{label}</div>
          </AccordionTrigger>

          <AccordionContent>
            <div className="my-2 flex w-full flex-wrap items-center">
              {data.map((item) => (
                <SidebarButton
                  key={item.value}
                  selected={selected.includes(item.value)}
                  onClick={() => {
                    const newValues = selected.includes(item.value)
                      ? selected.filter((v) => v !== item.value)
                      : [...selected, item.value];
                    updater(newValues);
                  }}
                  className="mb-2 mr-2"
                >
                  {item.label}
                </SidebarButton>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default SidebarSection;