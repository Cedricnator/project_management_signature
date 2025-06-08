import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { UpdateFileDto } from './dto/update-file.dto';
import { join } from 'path';
import { createReadStream, existsSync, unlinkSync } from 'fs';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Repository } from 'typeorm';
import { DocumentStatusType } from './entities/document_status_type.entity';
import { DocumentHistory } from './entities/document_history.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private documentRepository: Repository<File>,
    @InjectRepository(DocumentStatusType)
    private documentStatusRepository: Repository<DocumentStatusType>,
    @InjectRepository(DocumentHistory)
    private documentHistoryRepository: Repository<DocumentHistory>,
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

  async uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided!');
    }

    const draftStatus = await this.findDocumentStatus(
      '01974b23-bc2f-7e5f-a9d0-73a5774d2778',
    );

    if (!draftStatus) {
      throw new NotFoundException('pending_review status not found');
    }

    const document = this.documentRepository.create({
      name: file.originalname,
      description: '',
      currentStatusId: draftStatus.id,
      filePath: file.path,
      fileSize: file.size,
      mimetype: file.mimetype,
      originalFilename: file.originalname,
      filename: file.filename,
    });

    const savedDocument = await this.documentRepository.save(document);

    const historyEntry = this.documentHistoryRepository.create({
      documentId: savedDocument.id,
      statusId: draftStatus.id,
      changedBy: '01974b59-5913-713e-ae09-5a11333ab37e', //TODO: SET dynamic user
      comment: 'File uploaded',
      createdAt: new Date(),
    });

    await this.documentHistoryRepository.save(historyEntry);

    return { document: savedDocument };
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
    updateFileDto?: UpdateFileDto,
  ) {
    const document = await this.findOne(id);

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

    // Update document properties
    document.name = newFile.originalname;
    document.filePath = newFile.path;
    document.fileSize = newFile.size;
    document.mimetype = newFile.mimetype;
    document.originalFilename = newFile.originalname;
    document.filename = newFile.filename;

    const updatedDocument = await this.documentRepository.save(document);

    // Crear entrada en historial
    const historyEntry = this.documentHistoryRepository.create({
      documentId: document.id,
      statusId: document.currentStatusId,
      changedBy: '01974b59-5913-713e-ae09-5a11333ab37e',
      comment: 'Document file updated',
    });

    await this.documentHistoryRepository.save(historyEntry);

    return {
      message: 'File updated successfully',
      document: updatedDocument,
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
      message: 'File deleted successfully',
      deletedDocument: {
        id: document.id,
        documentName: document.name,
      },
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
      comment: comment || `Status changed to ${newStatus.status}`,
    });

    await this.documentHistoryRepository.save(historyEntry);

    return {
      message: `Document status updated to ${newStatus.status}`,
      document: await this.findOne(id),
    };
  }

  async getFileHistory(id: string) {
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
}
