import {
  Column,
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { nanoid } from 'nanoid';
import { ProblemLanguage } from 'src/problem/entities/problem_language.entity';
import { Submission } from 'src/submission/entities/submission.entity';

@Entity({ name: 'language' })
export class Language {
  @PrimaryColumn({
    name: 'id',
  })
  public id: string;

  @Column()
  public name: string;

  @Column()
  public extension: string;

  @Column({
    name: 'default_time_limit',
    default: 500,
  })
  public default_time_limit: number;

  @Column({
    name: 'default_memory_limit',
    default: 50000,
  })
  public default_memory_limit: number;

  @Column()
  public sorting: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // Relation
  @OneToMany(() => ProblemLanguage, (problemLang) => problemLang.language, {
    onDelete: 'CASCADE',
  })
  public problems: ProblemLanguage[];
  @OneToMany(() => Submission, (submission) => submission.language, {
    onDelete: 'CASCADE',
  })
  public submissions: Submission[];

  @BeforeInsert()
  updateID() {
    const idStr = nanoid(16);
    this.id = `LGx${idStr}`;
  }
}
