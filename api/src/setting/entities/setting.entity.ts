import {
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'setting' })
export class Setting {
  @PrimaryColumn({
    name: 'key',
  })
  public key: string;

  @Column({
    name: 'value',
    default: '',
  })
  public value: string;
}
