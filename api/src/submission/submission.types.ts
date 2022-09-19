import { IFilter } from "utils/types";

export interface SubmissionFilter extends IFilter {
  assignmentId?: string;
  langId?: string;
  problemId?: string;
  accountId?: string;
  page?: number;
  limit?: number;
}