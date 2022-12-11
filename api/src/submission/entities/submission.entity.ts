import {
  Column,
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { nanoid } from 'nanoid';
import { Problem } from 'src/problem/entities/problem.entity';
import { Assignment } from 'src/assignment/entities/assignment.entity';
import { Account } from 'src/account/entities/account.entity';
import { Language } from 'src/language/entities/language.entity';
import { Queue } from 'src/queue/entities/queue.entity';

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
  
  @Column({
    name: 'result',
    default: '',
  })
  public result: string;

  @Column({
    name: 'coefficient',
    default: '',
  })
  coefficient: string;

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
  @ManyToOne(() => Assignment, (assignment)=> assignment.submissions)
  assignment: Assignment;

  @ManyToOne(() => Problem, (problem) => problem.submissions)
  problem: Problem;

  @ManyToOne(() => Account, (account) => account.submissions)
  submitter: Account;

  @ManyToOne(() => Language, (language) => language.submissions, { onDelete: 'CASCADE'})
  language: Language; 

  @OneToOne(() => Queue, { onDelete: 'CASCADE' })
  @JoinColumn()
  queue: Queue

  @BeforeInsert()
  updateID() {
    this.id = this.id || Queue.genId();
  }

  public static genId() {
    const idStr = nanoid(16);
    return `SMSx${idStr}`;
  }
}
