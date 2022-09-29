import { Assignment } from "src/assignment/entities/assignment.entity";
import { Language } from "src/language/entities/language.entity";
import { Problem } from "src/problem/entities/problem.entity";
import { IFilter } from "utils/types";

export interface SubmissionFilter extends IFilter {
  assignmentId?: string;
  langId?: string;
  problemId?: string;
  accountId?: string;
  page?: number;
  limit?: number;
}

export interface IAddSubmission {
  assignment: Assignment;
  problem: Problem;
  language: Language;
  code: string;
}