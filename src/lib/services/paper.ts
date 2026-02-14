import Paper from "@/db/papers";
import { type IPaper } from "@/interface";
import { escapeRegExp } from "@/lib/utils/regex";
import { extractUniqueValues } from "@/lib/utils/paper-aggregation";
import { connectToDatabase } from "../database/mongoose";
import { CustomError } from "@/lib/utils/error";
import { Types } from "mongoose";

export async function getPapersBySubject(subject: string) {
    if (!subject){
        throw new CustomError("Subject query parameter is required", 400);
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

export async function getPapersById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
        throw new CustomError("Invalid paper ID", 400);
    }
    await connectToDatabase();

    const paper = await Paper.findById(id);

    if (!paper) {
        throw new CustomError("Paper not found", 404);
    }

    return paper;
}