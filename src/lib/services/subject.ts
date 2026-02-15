import { connectToDatabase } from "@/lib/database/mongoose";
import { Course } from "@/db/course";

export async function getCourseList(){
	await connectToDatabase();
	return await Course.find().lean();
}