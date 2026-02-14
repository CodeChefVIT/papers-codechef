import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import { IRelatedSubject } from "@/interface";
import RelatedSubject from "@/db/relatedSubjects";
import { escapeRegExp } from "@/lib/utils/regex";
import { CustomError } from "@/lib/utils/error";
import { Course } from "@/db/course";

export async function getRelatedSubjects(subject: string) {
    await connectToDatabase();

    if (!subject) {
        throw new CustomError("Subject query parameter is required", 400);
    }

    const escapedSubject = escapeRegExp(subject);
    const subjects: IRelatedSubject[] = await RelatedSubject.find({
      subject: { $regex: new RegExp(`${escapedSubject}`, "i") },
    });

    return subjects;
}

export async function getCourses() {
    await connectToDatabase();
    const courses = await Course.find().lean();

    return courses;
}