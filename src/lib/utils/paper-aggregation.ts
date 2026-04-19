import { type IPaper } from "../../interface";


export function extractUniqueValues(papers: IPaper[]) {
  if (papers.length === 0) {
    return {
      unique_years: [],
      unique_slots: [],
      unique_exams: [],
      unique_campuses: [],
      unique_semesters: [],
    };
  }

  const unique_years = Array.from(new Set(papers.map((paper) => paper.year)));
  const unique_slots = Array.from(new Set(papers.map((paper) => paper.slot)));
  const unique_exams = Array.from(new Set(papers.map((paper) => paper.exam)));
  const unique_campuses = Array.from(new Set(papers.map((paper) => paper.campus)));
  const unique_semesters = Array.from(new Set(papers.map((paper) => paper.semester)));

  return {
    unique_years,
    unique_slots,
    unique_exams,
    unique_campuses,
    unique_semesters,
  };
}