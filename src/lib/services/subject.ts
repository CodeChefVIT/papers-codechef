import { connectToDatabase } from "@/lib/database/mongoose";
import { type IRelatedSubject } from "@/interface";
import { escapeRegExp } from "@/lib/utils/regex";
import { Course } from "@/db/course";
import RelatedSubject from "@/db/relatedSubjects";
import UpcomingSubject from "@/db/upcoming-paper";

export async function getCourseList(){
	await connectToDatabase();
	return await Course.find().lean();
}

export async function getRelatedSubjects(subject: string) {
	await connectToDatabase();
	const escapedSubject = escapeRegExp(subject);
	const subjects: IRelatedSubject[] = await RelatedSubject.find({
		subject: { $regex: new RegExp(`${escapedSubject}`, "i") },
	});

	return subjects[0]?.related_subjects ?? [];
}

export async function getUpcomingSubjects() {
  return await UpcomingSubject.find()
    .sort({ _id: 1 })
    .limit(16)
    .lean();
}