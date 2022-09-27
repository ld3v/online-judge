import {
  Column,
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  ManyToOne,
} from 'typeorm';
import { nanoid } from 'nanoid';
import { Problem } from 'src/problem/entities/problem.entity';
import { Assignment } from './assignment.entity';

@Entity({ name: 'assignment_problem' })
export class AssignmentProblem {
  @PrimaryColumn({
    name: 'id',
  })
  public id: string;

  @Column({
    name: 'score',
    default: 100,
  })
  public score: number;
  
  @Column()
  public ordering: number;

  @Column({
    name: 'problem_name',
    default: '',
  })
  public problem_name: string;

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

  // Relations
  @ManyToOne(() => Assignment, (assignment)=> assignment.problems, {
    onDelete: 'CASCADE',
  })
  assignment: Assignment;

  @ManyToOne(() => Problem, (problem) => problem.assignments, {
    onDelete: 'CASCADE',
  })
  problem: Problem;

  @BeforeInsert()
  updateID() {
    const idStr = nanoid(16);
    this.id = `ASM_PRBx${idStr}`;
  }
}
