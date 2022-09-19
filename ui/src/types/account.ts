import { TSearchQuery } from ".";
import { TProblem } from "./problem";

export type TAccountRole = 'admin' | 'user';

export type TAccountSearchQuery = TSearchQuery & {
  role?: TAccountRole;
};

export type TAccount = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: TAccountRole;
  selectedAssignment?: string;
  isLocked?: boolean; // [Admin], default is `false`
  isRoot?: boolean; // [Admin], default is `false`
  editable?: boolean;
  lockable?: boolean;
  roleEditable?: boolean; // !isRoot
  createdAt?: string; // [Admin]
  problemsCreated?: TProblem[];
  isValidated?: boolean; // [Personal | Admin]
  // In case error
  isError?: boolean;
  message?: string;
}