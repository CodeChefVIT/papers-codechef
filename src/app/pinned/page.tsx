import React from "react";
import SearchBar from "@/components/Searchbar/searchbar";

const Pinned = () => {
  return (
    <div id="pinned" className="mt-5 flex flex-col justify-between">
      <h1 className="mx-auto my-8 text-center font-vipnabd text-xl font-extrabold sm:text-2xl md:text-3xl">
        Pinned Subjects
      </h1>
      <div className="mb-3 flex w-full flex-col items-center gap-2 px-6">
        <div className="w-full">
          <SearchBar type="pinned" />
        </div>
      </div>
      {/* <div className="mt-6 flex w-full items-center justify-center">
        <p>You can pin upto 8 Subjects here</p>
      </div> */}
    </div>
  );
};

export default Pinned;
