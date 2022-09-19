import {
  Column,
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { nanoid } from 'nanoid';
import { AssignmentProblem } from './assignment_problem.entity';
import { AssignmentAccount } from './assignment_account.entity';
import { Submission } from 'src/submission/entities/submission.entity';

@Entity({ name: 'assignment' })
export class Assignment {
  @PrimaryColumn({
    name: 'id',
  })
  public id: string;

  @Column()
  public name: string;
  
  @Column({
    name: 'open',
    default: true,
  })
  public open: boolean;

  @Column({
    name: 'javaexceptions',
    default: true,
  })
  public javaexceptions: boolean;

  @Column({
    name: 'description',
    default: '',
  })
  public description: string;
  
  @Column({
    name: 'start_time',
    type: 'timestamp',
    default: null,
  })
  public start_time: string;
  
  @Column({
    name: 'finish_time',
    type: 'timestamp',
    default: null,
  })
  public finish_time: string;

  @Column({
    name: 'extra_time',
    default: 0,
  })
  public extra_time: number;

  @Column({
    name: 'late_rule',
    default: '',
  })
  public late_rule: string;

  @Column({
    name: 'moss_update',
    default: '',
  })
  public moss_update: string;

  @Column({
    name: 'is_public',
    default: false,
  })
  public is_public: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // Relations
  @OneToMany(() => AssignmentProblem, (assignmentProb) => assignmentProb.assignment, {
    onDelete: 'CASCADE',
  })
  public problems: AssignmentProblem[];

  @OneToMany(() => AssignmentAccount, (participant) => participant.assignment, {
    onDelete: 'CASCADE',
  })
  public accounts: AssignmentAccount[];

  @OneToMany(() => Submission, (submission) => submission.assignment, {
    onDelete: 'CASCADE',
  })
  public submissions: Submission[];

  @BeforeInsert()
  updateID() {
    const idStr = nanoid(16);
    this.id = `ASMx${idStr}`;
  }
}
