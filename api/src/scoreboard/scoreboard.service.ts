import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { AssignmentService } from 'src/assignment/assignment.service';
import { Assignment } from 'src/assignment/entities/assignment.entity';
import { Problem } from 'src/problem/entities/problem.entity';
import { ProblemService } from 'src/problem/problem.service';
import { TProblemWithAssignment } from 'src/problem/problem.types';
import { SubmissionService } from 'src/submission/submission.service';
import { Http503Exception } from 'utils/Exceptions/http503.exception';
import { array2Map } from 'utils/func';

// [TEMPORARY] - In the future, this variable's value will be got by SETTING module.
const PENALTY_SUBMIT_TIME = 300;

type TScoreboardItemProblem = {
  score: number;
  late: number;
  time: number;
  fullMark: boolean;
}
export interface IScoreboardItem {
  submissionId: string;
  account: {
    id: string;
    displayName?: string;
    username: string;
  };
  totalScore: number,
  totalAcceptedScore: number,
  solved: number,
  tried2Solve: number,
  penalty: number,
  problemsMap: Record<string, TScoreboardItemProblem>,
}

@Injectable()
export class ScoreboardService {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly submissionService: SubmissionService,
  ) {}

  /**
   * Generate scoreboard by assignment
   * 
   * ---
   * @param {Assignment} assignment Which assignment need to create scoreboard
   * @returns {Promise<Record<string, IScoreboardItem>>} Mapping between accountId & their result.
   */
  public async genScoreboard (assignment: Assignment): Promise<IScoreboardItem[]> {
    try {
      const startTime = moment(assignment.start_time);
      const finishTime = assignment.finish_time ? moment(assignment.finish_time) : undefined;

      const problemWithAssData = await this.assignmentService.getProblemWithAssignment(assignment);
      const { map: problemWithAssMapping } = array2Map<TProblemWithAssignment>(problemWithAssData, "id");

      const allFinalSubs = await this.submissionService.getFinalSubmissions(assignment);
      const countSubByAccAndProb = await this.submissionService.countSubGroupByAccountProblem(assignment);
      // Init data-source
      const scoresMapping: Record<string, IScoreboardItem> = {};

      // Line 58-93, Scoreboard_model.php
      allFinalSubs.forEach(finalSub => {
        const submitterId = finalSub.submitter.id;
        const problemId = finalSub.problem.id;
        const penaltySubmitTime = countSubByAccAndProb[submitterId] && countSubByAccAndProb[submitterId][problemId]
          ? countSubByAccAndProb[submitterId][problemId]
          : 0;
        const submitTime = moment(finalSub.created_at);
        const preScore = Math.ceil(finalSub.pre_score * (problemWithAssMapping[problemId].score ?? 0) / 10000);
        const finalScore = finalSub.coefficient === "error" ? 0 : Math.ceil(preScore * Number(finalSub.coefficient) / 100);
        
        const fullMark = finalSub.pre_score === 10000;
        const delay = submitTime.diff(startTime);
        const late = finishTime ? submitTime.diff(finishTime) : -1; // If finish = undefined -> Never late

        if (!scoresMapping[submitterId]) {
          scoresMapping[submitterId] = {
            submissionId: finalSub.id,
            account: {
              id: submitterId,
              displayName: finalSub.submitter.display_name,
              username: finalSub.submitter.username,
            },
            totalScore: 0,
            totalAcceptedScore: 0,
            solved: 0,
            tried2Solve: 0,
            penalty: 0,
            problemsMap: {},
          };
        }

        scoresMapping[submitterId].solved += fullMark ? 1 : 0;
        scoresMapping[submitterId].tried2Solve += 1;
        scoresMapping[submitterId].totalScore += finalScore;

        if (fullMark) {
          scoresMapping[submitterId].totalAcceptedScore += finalScore;
          scoresMapping[submitterId].penalty += (delay + penaltySubmitTime * PENALTY_SUBMIT_TIME)
        }

        scoresMapping[submitterId].problemsMap[problemId] = {
          score: finalScore,
          time: delay,
          late,
          fullMark,
        }
      });
      return Object.values(scoresMapping);
    } catch (err) {
      console.error(`[!] - Something went wrong while creating the scoreboard for "${assignment.id}":`, err);
      throw new Http503Exception('feature:scoreboard.create');
    }
  }
}
