import { nanoid } from 'nanoid';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { QueueName, QueueState } from '../queue.enum';

@Entity({ name: 'queue' })
export class Queue {
  @PrimaryColumn({
    name: 'id',
  })
  public id: string;

  @Column({
    name: 'job_id',
    default: '',
  })
  public job_id: string;

  @Column({
    name: 'name',
    enum: QueueName,
  })
  public name: string;

  @Column({
    name: 'note',
    default: '',
  })
  public note: string;

  @Column({
    name: 'state',
    enum: QueueState,
    default: QueueState.Create,
  })
  public state: string;

  @Column({
    name: 'process',
    default: '',
  })
  public process: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  public created_at: Date;

  @BeforeInsert()
  updateBeforeInsert() {
    const id = Queue.genId();
    this.id = this.id || id;
  }

  public static genId() {
    const idStr = nanoid(16);
    return `Qx${idStr}`;
  }
}
