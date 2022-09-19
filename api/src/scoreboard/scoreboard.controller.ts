import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AssignmentService } from 'src/assignment/assignment.service';
import RequestWithAccount from 'src/auth/dto/reqWithAccount.interface';
import JwtAuthGuard from 'src/auth/gaurd/jwtAuth.gaurd';
import { ScoreboardService } from './scoreboard.service';

@Controller('scoreboard')
export class ScoreboardController {
  constructor(
    private readonly scoreboardService: ScoreboardService,
    private readonly assignmentService: AssignmentService,
  ) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getScoreboard (
    @Req() { user }: RequestWithAccount,
    @Query() { assignmentId: id }: { assignmentId?: string }
  ) {
    try {
      const assignmentId = id || user.selected_assignment;
      if (!assignmentId) {
        return [];
      }
      const assignment = await this.assignmentService.getById(assignmentId);
      const scoreboardData = await this.scoreboardService.genScoreboard(assignment);
      return {
        assignment: this.assignmentService.transformData(assignment)[0],
        data: scoreboardData,
      };
    } catch (err) {
      throw err;
    }
  }
}
