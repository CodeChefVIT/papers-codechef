import { mongo } from "mongoose";

export interface IUpcomingSlot {
  slot: string;
}

export interface IUpcomingSubject {
  subject: string;
  slots: string[];
}

export interface PostRequestBody {
  tags: string;
}

export interface PaperResponse {
  file_url: string;
  subject: string;
  year: string;
  slot: string;
  exam: string;
}

export interface IAdminPaper {
  file_url: string;
  thumbnail_url: string;
  subject: string | null;
  slot: string | null;
  year: string | null;
  exam: "CAT-1" | "CAT-2" | "FAT" | "Model" | null;
  semester:
    | "Fall Semester"
    | "Winter Semester"
    | "Summer Semester"
    | "Weekend Semester"
    | null;
  campus:
    | "Vellore"
    | "Chennai"
    | "Andhra Pradesh"
    | "Bhopal"
    | "Bangalore"
    | "Mauritius"
    | null;
  answer_key_included?: boolean | null;
  is_selected?: boolean;
  ambiguous_tags: string[];
}

export interface ICourses {
  name: string;
}

export interface IAdminUpload {
  form_data: FormData;
  files: File[];
  public_ids: Array<string>;
  subject: string;
  slot: string;
  year: string;
  exam: "CAT-1" | "CAT-2" | "FAT";
  is_pdf: boolean;
}

export interface APIResponse {
  message: string;
  status: number;
}

export interface ConverttoPDFResponse {
  url: string;
  secure_url: string;
  asset_id: string;
  public_id: string;
  version: number;
}

export interface LoginResponse {
  token: string;
}

export interface ErrorResponse {
  message: string;
}

export interface IUpcomingPaper extends mongo.Document {
  subject: string;
  slots: string[];
}

export interface IPaper {
  _id: string;
  exam: "CAT-1" | "CAT-2" | "FAT" | "Model CAT-1" | "Model CAT-2" | "Model FAT";
  file_url: string;
  thumbnail_url: string;
  semester:
    | "Fall Semester"
    | "Winter Semester"
    | "Summer Semester"
    | "Weekend Semester";
  campus:
    | "Vellore"
    | "Chennai"
    | "Andhra Pradesh"
    | "Bhopal"
    | "Bangalore"
    | "Mauritius";
  slot: string;
  subject: string;
  year: string;
  answer_key_included?: boolean;
}

export type ExamDetail = {
  subject: string;
  slot: string;
  "course-code": string;
  exam: string;
  semester:
    | "Fall Semester"
    | "Winter Semester"
    | "Summer Semester"
    | "Weekend Semester";
  year: string;
  answer_key_included: boolean | undefined;
};

export interface Filters {
  papers: IPaper[];
  unique_exams: string[];
  unique_slots: string[];
  unique_years: string[];
  unique_campuses: string[];
  unique_semesters: string[];
}

export type StoredSubjects = string[];

export interface TransformedPaper {
  subject: string;
  slots: string[];
}

export interface IRelatedSubject {
  subject: string;
  related_subjects: string[];
}

export interface ICourseCount {
  name: string;
  count: number;
}

export interface ICourse {
  _id: string;
  name: string;
}

export interface ICourseWithCount {
  _id: string;
  name: string;
  count: number;
}
