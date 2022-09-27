import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  ManyToOne,
} from 'typeorm';
import { nanoid } from 'nanoid';
import { Assignment } from './assignment.entity';
import { Account } from 'src/account/entities/account.entity';

@Entity({ name: 'assignment_account' })
export class AssignmentAccount {
  @PrimaryColumn()
  public id: string;

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
  @ManyToOne(() => Assignment, (assignment) => assignment.accounts, {
    onDelete: 'CASCADE',
  })
  assignment: Assignment;
  @ManyToOne(() => Account, (account) => account.assignments, {
    onDelete: 'CASCADE',
  })
  account: Account;

  @BeforeInsert()
  updateID() {
    const idStr = nanoid(16);
    this.id = `ASM_ACx${idStr}`;
  }
}
