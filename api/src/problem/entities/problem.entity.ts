import {
  Column,
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  BeforeInsert,
  ManyToOne,
} from 'typeorm';
import { nanoid } from 'nanoid';
import { Account } from 'src/account/entities/account.entity';
import { ProblemLanguage } from './problem_language.entity';
import { AssignmentProblem } from 'src/assignment/entities/assignment_problem.entity';
import { Submission } from 'src/submission/entities/submission.entity';

@Entity({ name: 'problem' })
export class Problem {
  @PrimaryColumn({
    name: 'id',
  })
  public id: string;

  @Column()
  public name: string;

  @Column()
  public content: string;

  @Column({
    name: 'diff_cmd',
    default: 'diff',
  })
  public diff_cmd: string;

  @Column({
    name: 'diff_arg',
    default: '-bB'
  })
  public diff_arg: string;

  @Column({
    name: 'admin_note',
    default: '',
  })
  public admin_note: string;

  @CreateDateColumn({
    type: 'timestamptz'
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamptz'
  })
  updated_at: Date;

  @DeleteDateColumn({
    type: 'timestamptz'
  })
  deleted_at: Date;

  // Other
  status?: string;

  // Relation
  @OneToMany(() => AssignmentProblem, (assignmentProb) => assignmentProb.problem, {
    onDelete: 'CASCADE',
  })
  public assignments: AssignmentProblem[];

  @OneToMany(() => ProblemLanguage, (problemLang) => problemLang.problem, {
    onDelete: 'CASCADE',
  })
  public languages: ProblemLanguage[];

  @OneToMany(() => Submission, (submission) => submission.problem, {
    onDelete: 'CASCADE',
  })
  public submissions: Submission[];

  @ManyToOne(() => Account, (account) => account.problems_created)
  created_by: Account;

  @BeforeInsert()
  updateID() {
    const idStr = nanoid(16);
    this.id = `PRBx${idStr}`;
  }
}
