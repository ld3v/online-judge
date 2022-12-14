import { TLanguageExt } from "@/components/Code/CodeEditor/language";
import { TSearchQuery } from ".";

export type TAssignmentSearchQuery = TSearchQuery & {
  sorter_field: string;
  sorter_type: 'ASC' | 'DESC';
};
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
  lateRules: string;
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
  langExtAvailable: TLanguageExt[];
};

export type TCoefficientRuleType = "VARIANT_OVER_TIME" | "CONST";
export interface ICoefficientRule {
  DELAY_RANGE: [number, number];
  BASE_MINS?: number;
  VARIANT_OVER_TIME?: [number, number];
  CONST?: number;
}
export type TCoefficientRuleField = "DELAY_RANGE" | "BASE_MINS" | "VARIANT_OVER_TIME" | "CONST";
