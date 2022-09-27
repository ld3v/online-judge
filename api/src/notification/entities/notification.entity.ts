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

@Entity({ name: 'notification' })
export class Notification {
  @PrimaryColumn({
    name: 'id',
  })
  public id: string;

  @Column()
  public title: string;

  @Column()
  public text: string;

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
  @ManyToOne(() => Account, (account) => account.notifications_created)
  created_by: Account;

  @BeforeInsert()
  updateID() {
    const idStr = nanoid(16);
    this.id = `PRBx${idStr}`;
  }
}
