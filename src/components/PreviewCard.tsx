import { type IPaper } from "@/interface";
import Image from "next/image";
import {
  extractBracketContent,
  extractWithoutBracketContent,
} from "@/util/utils";
import { capsule } from "@/util/utils";
import Link from "next/link";

const PreviewCard = ({ paper }: { paper: IPaper }) => {
  if (paper.finalUrl.startsWith("http://")) {
    paper.finalUrl = paper.finalUrl.replace("http://", "https://");
  }
  return (
    <div
      key={paper._id}
      className="w-[60%] space-y-1 rounded-xl border-2 border-black bg-white p-4 hover:border-[#434dba] dark:border-[#434dba] dark:bg-black dark:hover:border-white md:w-56"
    >
      <Link
        href={`/paper/${paper._id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src={paper.thumbnailUrl}
          alt={paper.subject}
          width={180}
          height={180}
          className="mb-2 h-[156px] w-full object-cover md:h-[170px]"
        />

        <div className="flex h-28 flex-col justify-center space-y-2">
          <div className="font-sans text-sm font-medium">
            {extractBracketContent(paper.subject)}
          </div>
          <div className="cursor-pointer font-sans text-base font-semibold">
            {extractWithoutBracketContent(paper.subject)}
          </div>
          <div className="flex gap-2">
            {capsule(paper.exam)}
            {capsule(paper.slot)}
            {capsule(paper.year)}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PreviewCard;
