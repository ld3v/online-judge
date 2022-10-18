import { Role } from "src/account/account.enum";
import { Account } from "src/account/entities/account.entity";
import { Assignment } from "src/assignment/entities/assignment.entity";
import { Language } from "src/language/entities/language.entity";
import { Problem } from "src/problem/entities/problem.entity";

type TJudgeAccountRole = "admin" | "student";
type TJudgeAccount = {
  username: string;
  display_name: string;
  email: string;
  role: TJudgeAccountRole;
}
type TJudgeLang = {
  name: string;
  extension: string;
  default_time_limit: string;
  default_memory_limit: string;
}
export type TJudgeAssignmentProblem = {
  id: string;
  ordering: string;
  score: string;
  problem_name: string;
}
type TJudgeAssignment = {
  id: string;
  name: string;
  description?: string;
  start_time: string; // "2022-12-31 23:59:00"
  finish_time: string; // "2022-12-31 23:59:00"
  extra_time: string; // Number
  open: string; // Boolean: "1" | "0"
  javaexceptions: string; // Boolean: "1" | "0"
  late_rule: string;
  participants: string; // "ALL" | username[]
  problems: TJudgeAssignmentProblem[];
}
export type TJudgeProblemLang = {
  id: string;
  name: string;
  default_time_limit: string;
  default_memory_limit: string;
  time_limit: string;
  memory_limit: string;
  // Not use, currently -> Commented
  // extension: string;
  // sorting: string;
  // problem_id: string;

};
export type TJudgeProblem = {
  id: string;
  name: string;
  description: string; // If empty, default is `<p>Description not found</p>`.
  languages: TJudgeProblemLang[]; // "lang1, lang2, lang3"
  diff_cmd: string; // diff
  diff_arg: string; // -bB
  admin_note: string;
  assignments: string[];
}
export type TJudgeProblemTransformed = {
  problem: Problem;
  judgeId: number;
  judgeLanguages: TJudgeProblemLang[];
  judgeAssignmentIds: number[];
}


export const judgeAccount2Account = (accounts: TJudgeAccount[]): Account[] => {
  return accounts.map(({ display_name, email, username, role }) => {
    const newAcc = new Account();
    newAcc.display_name = display_name;
    newAcc.email = email;
    newAcc.username = username;
    newAcc.role = judgeAccountRole2AccountRole(role);
    return newAcc;
  })
}

export const judgeLang2Lang = (langs: TJudgeLang[]): Language[] => {
  return langs.map(({ name, extension, default_memory_limit, default_time_limit }) => {
    const newLang = new Language();
    newLang.name = name;
    newLang.extension = extension;
    newLang.default_memory_limit = Number(default_memory_limit || 50000);
    newLang.default_time_limit = Number(default_time_limit || 500);
    return newLang;
  });
}

export const judgeAssignment2Assignment = (
  assignments: TJudgeAssignment[]
): {
  assignment: Assignment;
  judgeId: number;
  judgeProblems: TJudgeAssignmentProblem[];
  participantUsernames: string[],
}[] => {
  return assignments.map(({
    id,
    name,
    description,
    start_time,
    finish_time,
    extra_time,
    late_rule,
    open,
    javaexceptions,
    participants,
    problems,
  }) => {
    const startTime = start_time ? new Date(start_time) : undefined;
    const finishTime = finish_time ? new Date(finish_time) : undefined;

    const newAss = new Assignment();
    newAss.name = name;
    newAss.description = description;
    newAss.extra_time = Number(extra_time || 0);
    newAss.start_time = startTime;
    newAss.finish_time = finishTime;
    // Old rule is not available for this version! It still save to database, but not use in any cases!
    // To use new rule, check doc here: https://github.com/nqhd3v/online-judge/blob/main/api/docs/eval-coefficient.md
    newAss.late_rule = late_rule;
    newAss.open = !!open && open === "1";
    newAss.javaexceptions = !!javaexceptions && javaexceptions === "1";
    newAss.is_public = participants === "ALL";
    
    return {
      assignment: newAss,
      judgeId: Number(id || 0),
      judgeProblems: Array.isArray(problems) ? problems : [],
      participantUsernames: participants && participants !== "ALL"
        ? participants.split(',')
        : [],
    };
  });
}

export const judgeProblem2Problem = (
  judgeProblems: TJudgeProblem[],  
): TJudgeProblemTransformed[] => {
  return judgeProblems.map(({ id, name, description, admin_note, diff_arg, languages, diff_cmd, assignments }) => {
    const newProb = new Problem();

    newProb.name = name;
    newProb.content = description || "No content";
    newProb.admin_note = admin_note;
    newProb.diff_cmd = diff_cmd;
    newProb.diff_arg = diff_arg;

    return {
      problem: newProb,
      judgeId: Number(id),
      judgeLanguages: languages || [],
      judgeAssignmentIds: Array.isArray(assignments)
        ? assignments.map(assId => Number(assId)).filter(assId => assId)
        : [],
    };
  })
}

export const judgeAccountRole2AccountRole = (judgeRole: TJudgeAccountRole): Role => {
  if (judgeRole === "admin") {
    return Role.Admin;
  }
  return Role.User;
}