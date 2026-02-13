import Paper from "@/db/papers";
import { type IPaper } from "@/interface";
import { escapeRegExp } from "@/lib/utils/regex";
import { extractUniqueValues } from "@/lib/utils/paper-aggregation";
import { connectToDatabase } from "../database/mongoose";

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