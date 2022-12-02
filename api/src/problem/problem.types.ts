import { IFilter } from "utils/types";

export interface ProblemFilter extends IFilter {
  assignmentIds?: string;
  langIds?: string;
  accountId?: string;
  except?: string;
  keyword?: string;
  // Pagination
  page?: number;
  limit?: number;
}

export type TProblemWithAssignment = {
  id: string;
  name: string;
  content: string;
  status?: string;
  // From assignment_problem
  problemName: string;
  score: number;
  preScore?: number; // Only available when get Problems by Assignment
}

export type TProblemTemplate = {
  banned: string[];
  before: string;
  after: string;
  err?: any;
}