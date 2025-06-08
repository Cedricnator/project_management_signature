import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DocumentStatusType } from './document_status_type.entity';
import { DocumentHistory } from './document_history.entity';

@Entity('document')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'document_name', length: 255 })
  documentName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'current_status_id' })
  currentStatusId: string;

  @Column({ name: 'file_path', length: 500, nullable: true })
  filePath: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize: number;

  @Column({ length: 100, nullable: true })
  mimetype: string;

  @Column({ name: 'original_filename', length: 255, nullable: true })
  originalFilename: string;

  @Column({ length: 255, nullable: true })
  filename: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => DocumentStatusType)
  @JoinColumn({ name: 'current_status_id' })
  currentStatus: DocumentStatusType;

  @OneToMany(() => DocumentHistory, (history) => history.documentId)
  history: DocumentHistory[];
}
