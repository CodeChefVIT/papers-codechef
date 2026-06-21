import Paper from "@/db/papers";
import { type IPaper } from "@/interface";
import { escapeRegExp } from "@/lib/utils/regex";
import { extractUniqueValues } from "@/lib/utils/paper-aggregation";
import { connectToDatabase } from "../database/mongoose";
import CourseCount from "@/db/course";
import PaperRequest from "@/db/paperRequest";
import { type StoredSubjects } from "@/interface";
import { transformPapersToSubjectSlots } from "@/lib/services/paper-transform";

export interface CreatePaperInputType {
  subject: string;
  exam: string;
  slot: string;
  year: string;
}

export async function getPapersBySubject(subject: string) {
	if (!subject){
		throw new Error("Subject query parameter is required");
	}
	await connectToDatabase();
	
	const escapedSubject = escapeRegExp(subject);
	const papers: IPaper[] = await Paper.find({
		subject: { $regex: new RegExp(`${escapedSubject}`, "i") },
	});

	const uniqueValues = extractUniqueValues(papers);

	return {
		papers,
		...uniqueValues,
	}

}

export async function getPaperById(id: string) {
	await connectToDatabase();
	const paper = await Paper.findById(id);

	if (!paper) {
		throw new Error("Paper not found"); // 404
	}

	return paper;
}

export async function getCourseCounts(){
	await connectToDatabase();

	const count = await CourseCount.find().lean();

	const formatted = count.map((item) => ({
		name: item.name,
		count: item.count,
	}));

	return formatted;
}

export async function createPaperRequest({ subject, exam, slot, year} : CreatePaperInputType){
  await connectToDatabase();
  return await PaperRequest.create({ subject, exam, slot, year });
}

export async function getSelectedPapers() {
	await connectToDatabase();
  return await Paper.find({ isSelected: true }).limit(8);
}

export async function getPapersBySubjects(subjects: StoredSubjects) {
	await connectToDatabase();

  const usersPapers = await Paper.find({
    subject: { $in: subjects },
  });

	return transformPapersToSubjectSlots(usersPapers);
}