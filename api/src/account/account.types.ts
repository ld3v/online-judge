import { IFilter } from "utils/types";

export interface ICreateOne {
  username: string;
  password: string;
  email: string;
  display_name: string;
  role?: string; // Default is user
  is_validated?: boolean; // Default is `false`
  is_root?: boolean; // Default is `false`
}
export interface IUpdateOne {
  email: string;
  display_name: string;
  role?: string;
}
export interface IAccountTransformed {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  selectedAssignment: string;
  isLocked?: boolean;
  createdAt?: Date,
  problemsCreated?: number,
}

export interface AccountFilter extends IFilter {
  role?: string;
  exceptIds?: string[];
}

export type TGetAccountStatus = "find-only" | "found" | "notfound";