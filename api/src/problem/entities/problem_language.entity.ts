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
import { Problem } from './problem.entity';
import { Language } from 'src/language/entities/language.entity';

@Entity({ name: 'problem_language' })
export class ProblemLanguage {
  @PrimaryColumn()
  public id: string;

  @Column()
  public time_limit: number;

  @Column()
  public memory_limit: number;

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

  // Relation
  @ManyToOne(() => Problem, (problem) => problem.languages, {
    onDelete: 'CASCADE',
  })
  problem: Problem;
  @ManyToOne(() => Language, (language) => language.problems, {
    onDelete: 'CASCADE',
  })
  language: Language;

  @BeforeInsert()
  updateID() {
    const idStr = nanoid(16);
    this.id = `PRB_LGx${idStr}`;
  }
}
