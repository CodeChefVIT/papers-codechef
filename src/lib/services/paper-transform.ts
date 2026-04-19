import { type IPaper, type TransformedPaper } from "../../interface";

export function transformPapersToSubjectSlots(papers: IPaper[]): TransformedPaper[] {
  return papers.reduce<TransformedPaper[]>((acc, paper) => {
    const existing = acc.find((item) => item.subject === paper.subject);

    if (existing) {
      if (!existing.slots.includes(paper.slot)) {
        existing.slots.push(paper.slot);
      }
    } else {
      acc.push({ subject: paper.subject, slots: [paper.slot] });
    }

    return acc;
  }, []);
}