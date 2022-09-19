import { TSearchQuery } from ".";

export type TAssignmentSearchQuery = TSearchQuery;
export type TAssignmentCoefficientRule = {
  start: Date,
  finish?: Date,
  extra?: number;
  rule: string;
}

export type TAssignment = {
  id: string;
  name: string;
  description?: string;
  startTime: string;
  finishTime?: string;
  extraTime: number;
  lateRule: string;
  open: boolean;
  createdAt: string;
  coefficient: string;
  finished: boolean;
  problems: string[] | any[];
  participants: string[] | any[];
  submissions: string[] | any[];
};

export type TAssignmentProblem = {
  id: string;
  ordering: number;
  name: string; // problem's name
  problemName: string; // assignment-problem's name
  score: number;
};