import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { File } from './file.entity';
import { DocumentStatusType } from './document_status_type.entity';

@Entity('document_history')
export class DocumentHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'document_id', type: 'uuid' })
  documentId: string;

  @Column({ name: 'status_id', type: 'uuid' })
  statusId: string;

  @Column({ name: 'changed_by', type: 'uuid' })
  changedBy: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => File, (file) => file.history, { eager: false })
  @JoinColumn({ name: 'document_id' })
  document: File;

  @ManyToOne(() => DocumentStatusType, { eager: false })
  @JoinColumn({ name: 'status_id' })
  status: DocumentStatusType;
}
