import { Types } from "mongoose";
import { getPaperById } from "@/lib/services/paper";
import { success, failure } from "@/lib/utils/response"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!Types.ObjectId.isValid(id)) {
      return failure("Invalid paper ID");
    }
    const paper = await getPaperById(id);
    
    return success(paper);
  } catch (error) {
    console.error(error);
    return failure("Failed to fetch paper", 500);
  }
}
