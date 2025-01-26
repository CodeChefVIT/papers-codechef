"use client";

import CatalogueContent from "@/components/CatalogueContent";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Loader from "@/components/ui/loader";
const Catalogue = () => {
  return (
    <>
      <Navbar />
      <Suspense fallback={<Loader />}>
        <CatalogueContent />
      </Suspense>
    </>
  );
};

export default Catalogue;
