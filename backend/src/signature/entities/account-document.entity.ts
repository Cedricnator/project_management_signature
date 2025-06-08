import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { File } from '../../files/entities/file.entity';
import { User } from '../../users/entities/user.entity';

@Entity('account_document')
export class AccountDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({ name: 'document_id', type: 'uuid' })
  documentId: string;

  @Column({ name: 'validated', type: 'boolean', default: false })
  validated: boolean;

  @Column({ name: 'validated_at', nullable: true })
  validatedAt: Date;

  @Column({ name: 'signature_hash', nullable: true, length: 255 })
  signatureHash: string;

  @Column({ name: 'ip_address', nullable: true, length: 45 })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true, length: 255 })
  userAgent: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'account_id' })
  account: User;

  @ManyToOne(() => File)
  @JoinColumn({ name: 'document_id' })
  document: File;
}
