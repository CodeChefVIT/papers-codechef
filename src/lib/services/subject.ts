import { connectToDatabase } from "@/lib/database/mongoose";
import { IRelatedSubject } from "@/interface";
import { escapeRegExp } from "@/lib/utils/regex";
import RelatedSubject from "@/db/relatedSubjects";

export async function getRelatedSubjects(subject: string) {
	await connectToDatabase();
	const escapedSubject = escapeRegExp(subject);
	const subjects: IRelatedSubject[] = await RelatedSubject.find({
		subject: { $regex: new RegExp(`${escapedSubject}`, "i") },
	});

	return subjects[0]?.related_subjects ?? [];
}