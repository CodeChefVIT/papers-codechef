"use client";

import React from "react";
import { type IPaper } from "@/interface";
import Image from "next/image";
import { X } from "lucide-react";
import { Eye, Download, Check } from "lucide-react";
import {
  extractBracketContent,
  extractWithoutBracketContent,
} from "@/lib/utils/string";
import {
  getSecureUrl,
  generateFileName,
  downloadFile,
} from "@/lib/utils/download";
import { Capsule } from "@/components/ui/capsule";
import { cn } from "@/lib/utils";
import PDFViewer from "@/components/newPdfViewer";
import { PaperProvider } from "@/context/PaperContext";

interface CardProps {
  paper: IPaper;
  onSelect: (paper: IPaper, isSelected: boolean) => void;
  isSelected: boolean;
  isShow?: boolean;
}

const Card = ({ paper, onSelect, isSelected, isShow=true }: CardProps) => {
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const handleDownload = async (paper: IPaper) => {
    await downloadFile(getSecureUrl(paper.file_url), generateFileName(paper));
  };

  const handleCheckboxChange = () => {
    onSelect(paper, !isSelected);
  };

  const paperLink = `/paper/${paper._id}`;

  return (
    <>
      <div
        onClick={(e) => {
  const target = e.target as HTMLElement;

  if (target.closest("button, input, svg")) return;

  window.open(paperLink, "_blank");
}}
        className={cn(
          "cursor-pointer overflow-hidden rounded-sm border-2 border-[#734DFF] bg-[#FFFFFF] font-play transition-all duration-150 hover:bg-[#EFEAFF] dark:border-[#36266D] dark:bg-[#171720] hover:dark:bg-[#262635]",
          isSelected && "ring-2 ring-[#7480FF] bg-[#EFEAFF]"
        )}
      >
          <Image
            src={paper.thumbnail_url}
            alt={paper.subject}
            width={320}
            height={180}
            className="w-full object-cover p-4 pb-3 md:h-[250px]"
          />
          <div className="justify-center">
            <div className="flex flex-row items-center justify-between px-4 pb-2">
              <div className="text-md font-play font-medium">
                {extractBracketContent(paper.subject)}
              </div>
            </div>

            <div className="h-[1px] w-full bg-[#734DFF] dark:bg-[#36266D]" />

            <div className="space-y-2 p-4">
              <div className="font-play text-lg font-semibold">
                {extractWithoutBracketContent(paper.subject)}
              </div>
              <div className="flex flex-wrap gap-2">
                <Capsule>{paper.exam}</Capsule>
                <Capsule>{paper.slot}</Capsule>
                <Capsule>{paper.year}</Capsule>
                <Capsule>{paper.semester}</Capsule>
              </div>
            </div>
          </div>

        <div className="flex justify-end gap-2 px-4 pb-2">
          <Eye
           className="cursor-pointer transition-all duration-200 ease-out hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewOpen(true);
              }}
            />

          <Download
            size={20}
            onClick={(e) => {
              e.stopPropagation();
              void handleDownload(paper);
            }}
            className="cursor-pointer"
          />
        </div>
         
        <div className="flex items-center justify-between gap-2 px-4 pb-4 font-play">
          {isShow && <div className="flex items-center gap-2">
            <input
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                handleCheckboxChange();
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-5 w-5 accent-[#7480FF]"
              type="checkbox"
            />
            <p>Select</p>
          </div>}

          {paper.answer_key_included && (
            <div className="flex items-center gap-2 font-normal text-[#7480FF]">
              <Check color="#7480FF" />
              Answer Key
            </div>
          )}
        </div>
      </div>

      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative h-[90vh] w-[95%] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
          <button
            className="absolute left-4 top-4 z-[60] rounded-full bg-black/60 p-2 text-white transition hover:bg-black"
            onClick={() => setPreviewOpen(false)}
          >
            <X size={18} />
          </button>
          <PaperProvider
            value={{
              paperId: paper._id,
              subject: paper.subject,
              exam: paper.exam,
              slot: paper.slot,
              year: paper.year,
            }}
          >
            <PDFViewer
              url={getSecureUrl(paper.file_url)}
              name={generateFileName(paper).replace(/\.[^.]+$/, "")}
              className="h-full overflow-hidden"
              height="100%"
              hideControls={true}
              backgroundColor="transparent"
            />
          </PaperProvider>
          </div>
        </div>
      )}
    </>
  );
};

export default Card;
