import {
  Column,
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
  BeforeInsert,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { nanoid } from 'nanoid';
import { Account } from 'src/account/entities/account.entity';
import * as moment from 'moment';
import { UsedFor } from '../auth.enum';

@Entity({ name: 'auth' })
export class Auth {
  @PrimaryColumn({
    name: 'id',
  })
  public id: string;

  @Exclude()
  @Column({
    name: 'token',
  })
  public token: string;

  @Column({
    name: 'expired_at',
    default: moment().add(3, 'hours').toDate(),
  })
  expired_at: Date;

  @Column({
    name: 'used_for',
    enum: UsedFor,
    default: UsedFor.CreatePassword,
  })
  used_for: string;

  @Column({
    name: 'is_used',
    default: false,
  })
  public is_used: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // Relation
  @ManyToOne(() => Account)
  @JoinColumn()
  account: Account;

  @BeforeInsert()
  updateBeforeInsert() {
    const idStr = nanoid(16);
    this.id = `Ax${idStr}`;
    this.token = nanoid(32);
  }
}
