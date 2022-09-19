import { TSearchQuery } from ".";
import { TAccount } from "./account";
import { TAssignment } from "./assignment";
import { TProblem } from "./problem";

export type TSubmissionSearchQuery = TSearchQuery & {
  assignmentId?: string;
  accountId?: string;
};

export type TSubmission = {
  id: string;
  submitter: TAccount;
  language: any;
  problem: TProblem;
  assignment: TAssignment;
  is_final: boolean;
  pre_score: number;
  status: string;
  coefficient: string;
  file?: string;
  created_at: string;
}