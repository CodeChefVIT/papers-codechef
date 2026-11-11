import axios from "axios";
import { useEffect, useState } from "react";
import { type ApiResponse, type PaperCounts } from "@/interface";
import { chunkArray } from "@/lib/utils/array";

const countsChanged = "paperCountsChanged";

export async function sendPaperActivity(kind: "view" | "download", paperIds: string[]) {
  for (const batch of chunkArray(paperIds, 100)) {
    try {
      const response = await axios.post<ApiResponse<Record<string, PaperCounts>>>(
        "/api/paper-counts",
        { kind, paperIds: batch },
      );
      const counts = response.data.data;
      if (counts) {
        window.dispatchEvent(new CustomEvent(countsChanged, { detail: counts }));
      }
    } catch {
      return;
    }
  }
}

export function usePaperCounts(paperId: string, initial: PaperCounts) {
  const [counts, setCounts] = useState(initial);

  useEffect(() => {
    const takeFresh = (event: Event) => {
      const fresh = (event as CustomEvent<Record<string, PaperCounts>>).detail[paperId];
      if (fresh) setCounts(fresh);
    };
    window.addEventListener(countsChanged, takeFresh);
    return () => window.removeEventListener(countsChanged, takeFresh);
  }, [paperId]);

  return counts;
}

const compact = new Intl.NumberFormat("en", { notation: "compact" });

export function describeCount(count: number, word: string) {
  return `${compact.format(count)} ${word}${count === 1 ? "" : "s"}`;
}
