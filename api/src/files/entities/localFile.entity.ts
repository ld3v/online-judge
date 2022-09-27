import { nanoid } from 'nanoid';
import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
 
@Entity({ name: 'local_file' })
export class LocalFile {
  @PrimaryColumn()
  public id: string;
 
  @Column()
  filename: string;
 
  @Column()
  path: string;
 
  @Column()
  mimetype: string;

  @CreateDateColumn({
    type: 'timestamptz'
  })
  created_at: Date;

  @BeforeInsert()
  updateID() {
    const idStr = nanoid(16);
    this.id = `Fx${idStr}`;
  }
}
