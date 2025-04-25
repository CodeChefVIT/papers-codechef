"use client";

import { useEffect, useState } from "react";
import { type IPaper } from "@/interface";
import Image from "next/image";
import { Eye, Download, Check } from "lucide-react";
import {
  capsule,
  extractBracketContent,
  extractWithoutBracketContent,
} from "@/util/utils";
import axios from "axios";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CardProps {
  paper: IPaper;
  onSelect: (paper: IPaper, isSelected: boolean) => void;
  isSelected: boolean;
}

const Card = ({ paper, onSelect, isSelected }: CardProps) => {
  const [checked, setChecked] = useState<boolean>(isSelected);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    setChecked(isSelected);
  }, [isSelected]);

  const getSecureUrl = (url: string): string =>
    url.startsWith("http://") ? url.replace("http://", "https://") : url;

  const generateFileName = (paper: IPaper): string => {
    const extension = paper.finalUrl.split(".").pop();
    return `${extractBracketContent(paper.subject)}-${paper.exam}-${paper.slot}-${paper.year}.${extension}`;
  };

  const downloadFile = async (url: string, filename: string): Promise<void> => {
    try {
      const response = await axios.get(url, { responseType: "blob" });
      const blob = new Blob([response.data]);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleDownload = async (paper: IPaper) => {
    await downloadFile(getSecureUrl(paper.finalUrl), generateFileName(paper));
  };

  const handleCheckboxChange = () => {
    setChecked((prev) => {
      const newChecked = !prev;
      onSelect(paper, newChecked);
      return newChecked;
    });
  };
  const url = paper.thumbnailUrl;
  const urlArr = url.split("/")
  const paperLink = `/paper/${paper._id}`;
  useEffect(()=>{
    if(url.includes("/papers")){
      setFileName(`/1/${urlArr[urlArr.length-3] + "/" +urlArr[urlArr.length-2] +"/"+urlArr[urlArr.length-1]}`)
      
      return 
    }
    setFileName(`/2/${urlArr[urlArr.length-2] +"/"+urlArr[urlArr.length-1]}`)
    
  }, [])
  return (
    <div
      className={cn(
        "overflow-hidden rounded-sm border-2 border-[#734DFF] bg-[#FFFFFF] font-play transition-all duration-150 hover:bg-[#EFEAFF] dark:border-[#36266D] dark:bg-[#171720] hover:dark:bg-[#262635]",
        checked && "bg-white",
      )}
    >
      <Link href={paperLink} target="_blank" rel="noopener noreferrer">
        <Image
          src={fileName}
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
            <div className="flex gap-2">
              <Link href={paperLink} target="_blank" rel="noopener noreferrer">
                <Eye size={22} />
              </Link>
              <Download
                size={20}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void handleDownload(paper);
                }}
                className="cursor-pointer"
              />
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#734DFF] dark:bg-[#36266D]" />

          <div className="space-y-2 p-4">
            <div className="font-play text-lg font-semibold">
              {extractWithoutBracketContent(paper.subject)}
            </div>
            <div className="flex flex-wrap gap-2">
              {capsule(paper.exam)}
              {capsule(paper.slot)}
              {capsule(paper.year)}
              {capsule(paper.semester)}
            </div>
          </div>
        </div>
      </Link>

      <div className="hidden items-center justify-between gap-2 px-4 pb-4 font-play md:flex">
        <div className="flex items-center gap-2">
          <input
            checked={checked}
            onChange={handleCheckboxChange}
            className="h-5 w-5 accent-[#7480FF]"
            type="checkbox"
          />
          <p>Select</p>
        </div>
        {paper.answerKeyIncluded && (
          <div className="flex items-center gap-2 font-normal text-[#7480FF]">
            <Check color="#7480FF" />
            Answer Key
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
