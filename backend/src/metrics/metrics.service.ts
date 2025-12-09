import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { File } from '../files/entities/file.entity';
import { DocumentStatus } from '../files/enum/document-status.enum';

export interface SystemMetrics {
  totalUsers: number;
  totalDocuments: number;
  pendingSignatures: number;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  async getSystemMetrics(): Promise<SystemMetrics> {
    this.logger.log('Fetching system metrics');
    const [totalUsers, totalDocuments, pendingSignatures] = await Promise.all([
      this.userRepository.count(),
      this.fileRepository.count(),
      this.fileRepository.count({
        where: { currentStatusId: DocumentStatus.PENDING_REVIEW },
      }),
    ]);

    return {
      totalUsers,
      totalDocuments,
      pendingSignatures,
    };
  }
}
