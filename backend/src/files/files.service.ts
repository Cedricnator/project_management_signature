import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { UpdateFileDto } from './dto/update-file.dto';
import { join } from 'path';
import { createReadStream, existsSync, readFileSync, unlinkSync } from 'fs';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Repository } from 'typeorm';
import { DocumentStatusType } from './entities/document_status_type.entity';
import { DocumentHistory } from './entities/document_history.entity';
import { createHash } from 'crypto';
import { UploadFileDto } from './dto/upload-file.dto';
import { UsersService } from '../users/users.service';
import { DocumentHistoryModified } from './interfaces/document-historym.interface';
import { formatFriendlyDate } from '../common/helpers/format-date.helper';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private documentRepository: Repository<File>,
    @InjectRepository(DocumentStatusType)
    private documentStatusRepository: Repository<DocumentStatusType>,
    @InjectRepository(DocumentHistory)
    private documentHistoryRepository: Repository<DocumentHistory>,
    private readonly userService: UsersService,
  ) {}

  private async findDocumentStatus(id: string): Promise<DocumentStatusType> {
    try {
      const status = await this.documentStatusRepository.findOne({
        where: { id },
      });
      if (!status) {
        throw new NotFoundException(`Document status with id ${id} not found`);
      }
      return status;
    } catch (error) {
      console.error(`Error finding document status with id ${id}:`, error);
      throw new InternalServerErrorException(`Error finding document status`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    uploadFileDto: UploadFileDto,
    userEmail: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided!');
    }

    if (!file.buffer && !file.path) {
      throw new BadRequestException('File data is missing');
    }

    const user = await this.userService.findOneByEmail(userEmail);

    if (!user) {
      throw new NotFoundException(`User with email ${userEmail} not found`);
    }

    const draftStatus = await this.findDocumentStatus(
      '01974b23-bc2f-7e5f-a9d0-73a5774d2778',
    );

    if (!draftStatus) {
      throw new NotFoundException('pending_review status not found');
    }

    const documentHash = createHash('sha256')
      .update(file.buffer || file.path)
      .digest('hex');

    const document = this.documentRepository.create({
      name: uploadFileDto.name,
      description: uploadFileDto.description || '',
      currentStatusId: draftStatus.id,
      filePath: file.path,
      fileSize: file.size,
      mimetype: file.mimetype,
      originalFilename: file.originalname,
      filename: file.filename,
      uploadedBy: user.id,
      fileHash: documentHash,
    });

    const savedDocument = await this.documentRepository.save(document);

    const historyEntry = this.documentHistoryRepository.create({
      documentId: savedDocument.id,
      statusId: draftStatus.id,
      changedBy: user.id,
      comment:
        uploadFileDto.comment ||
        `Documento subido el ${formatFriendlyDate(new Date())}`,
      createdAt: new Date(),
    });

    await this.documentHistoryRepository.save(historyEntry);

    return { ...savedDocument };
  }

  async findFilesByUser(userId: string): Promise<File[]> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const documents = await this.documentRepository.find({
      where: { uploadedBy: user.id },
    });

    if (!documents || documents.length === 0) {
      throw new NotFoundException(`No documents found for user ${user.email}`);
    }

    return documents;
  }

  async findAll() {
    const documents = await this.documentRepository.find();
    return documents;
  }

  async findOne(id: string): Promise<File> {
    const document = await this.documentRepository.findOne({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }

    return document;
  }

  async getFileHistoryByUserId(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const documents = await this.documentRepository.find({
      where: { uploadedBy: user.id },
    });

    const documentHistory: DocumentHistoryModified[] = [];

    for (const document of documents) {
      const history = await this.documentHistoryRepository.findOne({
        where: { documentId: document.id },
        order: { createdAt: 'DESC' },
      });

      if (!history) {
        // Skip if no history found for this document
        continue;
      } else {
        const transformedHistory: DocumentHistoryModified = {
          id: history.id,
          documentId: history.documentId,
          statusId: history.statusId,
          changedBy: user.id
            ? `${user.firstName} ${user.lastName}`
            : 'Unknown User',
          comment: history.comment,
          createdAt: history.createdAt,
          updatedAt: history.updatedAt,
        };
        documentHistory.push(transformedHistory);
      }
    }

    return documentHistory;
  }

  async getFilesHistory() {
    const documentsHistory = await this.documentHistoryRepository.find();
    const transformedsHistory: DocumentHistoryModified[] = [];

    for (const documentHistory of documentsHistory) {
      const user = await this.userService.findOne(documentHistory.changedBy);

      if (!user) {
        throw new NotFoundException(
          `User with id ${documentHistory.changedBy} not found`,
        );
      }

      const transformedHistory: DocumentHistoryModified = {
        id: documentHistory.id,
        documentId: documentHistory.documentId,
        statusId: documentHistory.statusId,
        changedBy: user.id ? `${user.firstName} ${user.lastName}` : user.id,
        comment: documentHistory.comment,
        createdAt: documentHistory.createdAt,
        updatedAt: documentHistory.updatedAt,
      };
      transformedsHistory.push(transformedHistory);
    }

    return transformedsHistory;
  }

  async downloadFile(id: string, res: Response) {
    const document = await this.findOne(id);

    const filePath = join(process.cwd(), document.filePath);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${document.originalFilename}"`,
    );
    res.setHeader('Content-Type', document.mimetype);
    const fileStream = createReadStream(filePath);
    return new StreamableFile(fileStream);
  }

  async streamFile(id: string) {
    const document = await this.findOne(id);

    if (!document.filePath) {
      throw new NotFoundException('File path not found');
    }

    const filePath = join(process.cwd(), document.filePath);

    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    const fileStream = createReadStream(filePath);

    return new StreamableFile(fileStream, {
      type: document.mimetype,
      disposition: `inline; filename="${document.originalFilename}"`,
    });
  }

  async update(
    id: string,
    newFile: Express.Multer.File,
    userEmail: string,
    updateFileDto?: UpdateFileDto,
  ) {
    const document = await this.findOne(id);
    const user = await this.userService.findOneByEmail(userEmail);

    if (!user) {
      throw new NotFoundException(`User with email ${userEmail} not found`);
    }

    const allowedStatuses = [
      '01974b23-e943-7308-8185-1556429b9ff1', // rejected
      '01974b24-bc2f-7e5f-a9d0-73a5774d2778', // pending_review
    ];

    if (!allowedStatuses.includes(document.currentStatusId)) {
      throw new BadRequestException(
        'Document can only be updated if it is in a rejected or pending review status',
      );
    }

    // Delete previous file if it exists
    if (
      document.filePath &&
      existsSync(join(process.cwd(), document.filePath))
    ) {
      try {
        unlinkSync(join(process.cwd(), document.filePath));
      } catch (error) {
        console.warn(`Could not delete old file: ${document.filePath}`, error);
      }
    }

    let fileHash: string;
    try {
      if (newFile.buffer) {
        fileHash = createHash('sha256').update(newFile.buffer).digest('hex');
      } else if (newFile.path) {
        const fileBuffer = readFileSync(newFile.path);
        fileHash = createHash('sha256').update(fileBuffer).digest('hex');
      } else {
        throw new BadRequestException('Unable to access file data');
      }
    } catch (error: unknown) {
      console.error('Error calculating file hash:', error);
      throw new BadRequestException(`Error calculating file hash`);
    }

    // Update document properties
    document.name = newFile.originalname;
    document.filePath = newFile.path;
    document.fileSize = newFile.size;
    document.mimetype = newFile.mimetype;
    document.originalFilename = newFile.originalname;
    document.filename = newFile.filename;
    document.fileHash = fileHash;
    document.description = updateFileDto?.description || document.description;

    const pendingReviewStatusId = '01974b23-bc2f-7e5f-a9d0-73a5774d2778';
    if (document.currentStatusId === '01974b23-e943-7308-8185-1556429b9ff1') {
      // If the document was rejected, set it to pending review
      document.currentStatusId = pendingReviewStatusId;
    }

    const updatedDocument = await this.documentRepository.save(document);

    // Create history entry for the update
    const historyEntry = this.documentHistoryRepository.create({
      documentId: document.id,
      statusId: document.currentStatusId,
      changedBy: user.id,
      comment: `Documento actualizado el ${formatFriendlyDate(new Date())}`,
    });

    await this.documentHistoryRepository.save(historyEntry);

    return {
      ...updatedDocument,
    };
  }

  async remove(id: string) {
    const document = await this.findOne(id);

    // Delete file from disk
    if (
      document.filePath &&
      existsSync(join(process.cwd(), document.filePath))
    ) {
      try {
        unlinkSync(join(process.cwd(), document.filePath));
      } catch (error) {
        console.warn(`Could not delete file: ${document.filePath}`, error);
      }
    }

    // Delete document from db
    await this.documentRepository.remove(document);

    return {
      id: document.id,
      documentName: document.name,
    };
  }

  async changeFileStatus(
    id: string,
    statusId: string,
    comment?: string,
    changedBy?: string,
  ) {
    const document = await this.findOne(id);

    const newStatus = await this.documentStatusRepository.findOne({
      where: { id: statusId },
    });

    if (!newStatus) {
      throw new NotFoundException('Status not found');
    }

    // Update state of document
    document.currentStatusId = statusId;
    await this.documentRepository.save(document);

    // Create history entry
    const historyEntry = this.documentHistoryRepository.create({
      documentId: document.id,
      statusId: statusId,
      changedBy: changedBy,
      comment: comment || `Estado cambiado a: ${newStatus.status}`,
    });

    await this.documentHistoryRepository.save(historyEntry);

    return {
      message: `Document status updated to ${newStatus.status}`,
      document: await this.findOne(id),
    };
  }

  async getFileHistoryById(id: string) {
    const document = await this.findOne(id);

    const history = await this.documentHistoryRepository.find({
      where: { documentId: id },
      relations: ['status'],
      order: { createdAt: 'DESC' },
    });

    return {
      document: {
        id: document.id,
        documentName: document.name,
        currentStatus: document.currentStatus?.status,
      },
      history: history.map((h) => ({
        id: h.id,
        status: h.status?.status,
        comment: h.comment,
        changedBy: h.changedBy,
        createdAt: h.createdAt,
      })),
    };
  }

  async getStatusTypes() {
    try {
      return await this.documentStatusRepository.find({
        order: { status: 'ASC' },
      });
    } catch (error) {
      console.error('Error fetching document status types:', error);
      throw new InternalServerErrorException(
        'Could not fetch document status types',
      );
    }
  }

  verifyFileIntegrity(document: File): boolean {
    try {
      if (document.fileHash) {
        const currentHash = createHash('sha256')
          .update(document.filePath)
          .digest('hex');
        return currentHash === document.fileHash;
      }
      return false;
    } catch (error) {
      console.error('Error verifying file integrity:', error);
      throw new InternalServerErrorException('Could not verify file integrity');
    }
  }
}
