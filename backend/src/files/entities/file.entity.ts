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
import { User } from 'src/users/entities/user.entity';

@Entity('document')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'document_name', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'current_status_id', type: 'uuid', nullable: false })
  currentStatusId: string;

  @Column({ name: 'path', length: 500, nullable: true })
  filePath: string;

  @Column({ name: 'size', type: 'bigint', nullable: true })
  fileSize: number;

  @Column({ name: 'mime_type', length: 100, nullable: false })
  mimetype: string;

  @Column({ name: 'original_name', length: 255, nullable: false })
  originalFilename: string;

  @Column({ name: 'file_name', length: 255, nullable: false })
  filename: string;

  @Column({ name: 'file_hash', length: 255, nullable: false })
  fileHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'uploaded_by', type: 'uuid', nullable: false })
  uploadedBy: string;

  @ManyToOne(() => DocumentStatusType, { eager: false })
  @JoinColumn({ name: 'current_status_id' })
  currentStatus: DocumentStatusType;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'uploaded_by' })
  uploadBy: User;

  @OneToMany(() => DocumentHistory, (history) => history.documentId, {
    cascade: false,
  })
  history: DocumentHistory[];
}
