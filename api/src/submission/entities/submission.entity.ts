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
import { Assignment } from 'src/assignment/entities/assignment.entity';
import { Account } from 'src/account/entities/account.entity';
import { Language } from 'src/language/entities/language.entity';

@Entity({ name: 'submission' })
export class Submission {
  @PrimaryColumn({
    name: 'id',
  })
  public id: string;

  @Column({
    name: 'is_final',
    default: false,
  })
  public is_final: boolean;
  
  @Column({
    name: 'pre_score',
    default: 0,
  })
  public pre_score: number;

  // [NEED-CHECK]
  @Column({
    name: 'status',
    default: '',
  })
  public status: string;

  @Column({
    name: 'coefficient',
    default: '',
  })
  coefficient: string;

  // In source `wecode-judge`, this field is `file_name`.
  @Column({
    name: 'file',
    default: '',
  })
  file: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // Relations
  @ManyToOne(() => Assignment, (assignment)=> assignment.submissions)
  assignment: Assignment;

  @ManyToOne(() => Problem, (problem) => problem.submissions)
  problem: Problem;

  @ManyToOne(() => Account, (account) => account.submissions)
  submitter: Account;

  @ManyToOne(() => Language, (language) => language.submissions)
  language: Language;

  @BeforeInsert()
  updateID() {
    const idStr = nanoid(16);
    this.id = `SMSx${idStr}`;
  }
}
