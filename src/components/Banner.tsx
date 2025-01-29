import { Button } from "./ui/button";
import Image from "next/image";
import devsoc from "@/assets/DEVSOC.svg";
import Link from "next/link";

export default function Banner() {
  return (
    <>
      <div className="flex h-fit w-full items-center justify-center bg-[#434dba] px-6 py-3 text-center text-white sm:h-14 sm:py-0 md:sticky md:top-0 md:justify-between md:text-left z-50">
        <div className="flex items-center gap-x-2">
          <Image
            src={devsoc as HTMLImageElement}
            alt="devsoclogo"
            height={40}
            width={40}
            className="md:hidden"
          />
          <span className="hidden md:block">
            Register for DevSOC&apos;25 and enjoy a 3 day full OD to unwind after CATs!
          </span>
          <Link
            href="https://devsoc.codechefvit.com/"
            className="block md:hidden"
            rel="noopener noreferrer"
            target="_blank"
          >
            Register for DevSOC&apos;25
          </Link>
        </div>
        <div className="hidden md:block">
          <Button className="bg-[#AA7AE7]">
            <Link
              className="flex gap-x-2 items-center"
              href="https://devsoc.codechefvit.com/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span>
                <Image
                  src={devsoc as HTMLImageElement}
                  alt="devsoclogo"
                  height={20}
                  width={20}
                />
              </span>
              <span className="font-yerk text-xs">Register</span>
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
