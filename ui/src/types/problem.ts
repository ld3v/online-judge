import { TSearchQuery } from ".";

export type TProblemSearchQuery = TSearchQuery & {
  assignmentIds?: string;
  langIds?: string;
};

export type TProblemCreatedBy = {
  id: string;
  display_name: string;
}
export type TProblemAssignment = {
  id: string;
  name: string;
}
export type TProblemLanguage = {
  id: string;
  langId: string;
  name: string;
  timeLimit: number;
  memoryLimit: number;
}
export type TProblem = {
  id: string;
  name: string;
  content: string;
  status: string;
  note?: string; // [Admin]
  diff_cmd?: string; // [Admin], default is 'diff'
  diff_arg?: string; // [Admin], default is '-bB'
  created_by?: TProblemCreatedBy; // [Admin]
  assignments?: TProblemAssignment[]; // [Admin]
  languages: TProblemLanguage[];
}