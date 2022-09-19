import {
  Column,
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { nanoid } from 'nanoid';
import { Auth } from 'src/auth/entities/auth.entity';
import { Role } from '../account.enum';
import { Problem } from 'src/problem/entities/problem.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { AssignmentAccount } from 'src/assignment/entities/assignment_account.entity';
import { Submission } from 'src/submission/entities/submission.entity';

@Entity({ name: 'account' })
export class Account {
  @PrimaryColumn({
    name: 'id',
  })
  public id: string;

  @Column({
    name: 'username',
    unique: true,
  })
  public username: string;
  
  @Exclude()
  @Column({
    name: 'password',
    default: '',
  })
  public password: string;

  @Column({
    name: 'role',
    enum: Role,
    default: Role.User,
  })
  public role: string;

  @Column()
  public display_name: string;

  @Column({
    name: 'email',
    default: '',
  })
  public email: string;

  @Column({
    name: 'is_locked',
    default: false,
  })
  public is_locked: boolean;

  @Column({
    name: 'is_validated',
    default: false,
  })
  public is_validated: boolean;

  @Column({
    name: 'is_root',
    default: false,
  })
  public is_root: boolean;

  @Column({
    name: 'selected_assignment',
    default: '',
  })
  public selected_assignment: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // Relation
  @OneToMany(() => Auth, (auth) => auth.account, {
    onDelete: 'CASCADE',
  })
  auth: Auth[];
  @OneToMany(() => Notification, (notify) => notify.created_by, {
    onDelete: 'CASCADE',
  })
  notifications_created: Notification[];
  @OneToMany(() => Problem, (problem) => problem.created_by, {
    onDelete: 'CASCADE',
  })
  problems_created: Problem[];
  @OneToMany(() => Submission, (submission) => submission.submitter, {
    onDelete: 'CASCADE',
  })
  submissions: Submission[];

  @OneToMany(() => AssignmentAccount, (assignmentAcc) => assignmentAcc.account, {
    onDelete: 'CASCADE',
  })
  assignments: AssignmentAccount[];

  @BeforeInsert()
  updateID() {
    const idStr = nanoid(16);
    this.id = `ACx${idStr}`;
  }
}
