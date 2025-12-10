import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { UpdateFileDto } from './dto/update-file.dto';
import { join } from 'node:path';
import {
  createReadStream,
  existsSync,
  readFileSync,
  unlinkSync,
} from 'node:fs';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Like, Repository } from 'typeorm';
import { DocumentStatusType } from './entities/document_status_type.entity';
import { DocumentHistory } from './entities/document_history.entity';
import { createHash } from 'node:crypto';
import { UploadFileDto } from './dto/upload-file.dto';
import { UsersService } from '../users/users.service';
import { DocumentHistoryModified } from './interfaces/document-historym.interface';
import { formatFriendlyDate } from '../common/helpers/format-date.helper';
import { DocumentStatus } from './enum/document-status.enum';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private readonly documentRepository: Repository<File>,
    @InjectRepository(DocumentStatusType)
    private readonly documentStatusRepository: Repository<DocumentStatusType>,
    @InjectRepository(DocumentHistory)
    private readonly documentHistoryRepository: Repository<DocumentHistory>,
    private readonly userService: UsersService,
  ) {}

  /**
   * FindDocumentStatus
   * ------------------
   * Finds a document status by its ID.
   *
   * @param {string} id - The ID of the document status to find.
   * @returns {Promise<DocumentStatusType>} - The found DocumentStatusType.
   * @throws {NotFoundException} - if the status is not found.
   * @throws {InternalServerErrorException} - if there is an error during the database operation.
   */
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

  /**
   * UploadFile
   * ----------
   * Uploads a file and creates a document entry in the database.
   *
   * @param {Express.Multer.File} file - The file to upload.
   * @param {UploadFileDto} uploadFileDto - DTO containing file metadata.
   * @param {string} userEmail - Email of the user uploading the file.
   * @returns {Promise<File>} - The saved document entry.
   * @throws {BadRequestException} - If no file is provided or file data is missing.
   * @throws {NotFoundException} - If the user or draft status is not found.
   */
  async uploadFile(
    file: Express.Multer.File,
    uploadFileDto: UploadFileDto,
    userEmail: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided!');
    }

    if (!file.path || !existsSync(file.path)) {
      throw new BadRequestException('File not saved properly to disk');
    }

    const user = await this.userService.findOneByEmail(userEmail);
    if (!user) {
      throw new NotFoundException(`User with email ${userEmail} not found`);
    }

    let fileBuffer: Buffer;
    let documentHash: string;

    try {
      fileBuffer = readFileSync(file.path);
      documentHash = createHash('sha256').update(fileBuffer).digest('hex');
    } catch (error) {
      console.error('Error reading file or calculating hash:', error);
      throw new BadRequestException(`Error processing file: ${error.message}`);
    }

    const existingDocument = await this.documentRepository.findOne({
      where: { fileHash: documentHash },
      relations: ['uploadBy'],
    });

    if (existingDocument) {
      try {
        unlinkSync(file.path);
      } catch (cleanupError) {
        console.warn('Could not cleanup temporary file:', cleanupError);
      }

      if (existingDocument.uploadBy.id === user.id) {
        throw new ConflictException({
          message: 'You have already uploaded this file',
          existingDocument: {
            id: existingDocument.id,
            name: existingDocument.name,
            uploadedAt: existingDocument.createdAt,
            currentStatus: existingDocument.currentStatusId,
          },
        });
      } else {
        throw new ConflictException({
          message: 'This file has already been uploaded by another user',
          suggestion: 'Please verify this is not a duplicate submission',
          existingFileId: existingDocument.id,
          uploadedAt: existingDocument.createdAt,
        });
      }
    }

    const draftStatus = await this.findDocumentStatus(
      DocumentStatus.PENDING_REVIEW,
    );

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
      fileBuffer: fileBuffer,
    });

    const savedDocument = await this.documentRepository.save(document);

    const historyEntry = this.documentHistoryRepository.create({
      documentId: savedDocument.id,
      statusId: draftStatus.id,
      changedBy: user.id,
      comment:
        uploadFileDto.comment ||
        `Documento subido el ${formatFriendlyDate(new Date())}`,
    });

    await this.documentHistoryRepository.save(historyEntry);

    const { fileBuffer: _, ...documentWithoutBuffer } = savedDocument;
    return documentWithoutBuffer;
  }

  /**
   * FindFilesByUser
   * ---------------
   * Finds all files uploaded by a specific user.
   *
   * @param {string} userId - The ID of the user whose files to find.
   * @returns {Promise<File[]>} - An array of files uploaded by the user.
   * @throws {NotFoundException} - If the user or their documents are not found.
   */
  async findFilesByUser(userId: string): Promise<File[]> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const documents = await this.documentRepository.find({
      where: { uploadedBy: user.id },
      select: [
        'id',
        'name',
        'description',
        'filePath',
        'fileSize',
        'mimetype',
        'originalFilename',
        'filename',
        'uploadedBy',
        'currentStatusId',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!documents || documents.length === 0) {
      throw new NotFoundException(`No documents found for user ${user.email}`);
    }

    return documents;
  }

  /**
   * FindAll
   * -------
   * Retrieves all documents from the database.
   *
   * @returns {Promise<File[]>} - An array of all documents.
   */
  async findAll(search?: string): Promise<File[]> {
    const where: any = {};
    if (search) {
      where.name = Like(`%${search}%`);
    }

    const documents = await this.documentRepository.find({
      where,
      select: [
        'id',
        'name',
        'description',
        'filePath',
        'fileSize',
        'mimetype',
        'originalFilename',
        'filename',
        'uploadedBy',
        'currentStatusId',
        'createdAt',
        'updatedAt',
      ],
    });
    return documents;
  }

  async findDocumentWithBuffer(id: string): Promise<File> {
    const document = await this.documentRepository.findOne({
      where: { id },
    });
    if (!document) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }

    return document;
  }

  /**
   * FindOne
   * -------
   * Finds a document by its ID.
   *
   * @param {string} id - The ID of the document to find.
   * @returns {Promise<File>} - The found document.
   * @throws {NotFoundException} - If the document with the given ID is not found.
   */
  async findOne(id: string): Promise<File> {
    const document = await this.documentRepository.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'description',
        'filePath',
        'fileSize',
        'mimetype',
        'originalFilename',
        'filename',
        'uploadedBy',
        'currentStatusId',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!document) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }

    return document;
  }

  /**
   * GetFileHistoryByUserId
   * -----------------------
   * Retrieves the file history for a specific user.
   *
   * @param {string} userId - The ID of the user whose file history to retrieve.
   * @returns {Promise<DocumentHistoryModified[]>} - An array of document history entries for the user.
   * @throws {NotFoundException} - If the user or their documents are not found.
   */
  async getFileHistoryByUserId(
    userId: string,
  ): Promise<DocumentHistoryModified[]> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const documents = await this.documentRepository.find({
      where: { uploadedBy: user.id },
      select: [
        'id',
        'name',
        'description',
        'filePath',
        'fileSize',
        'mimetype',
        'originalFilename',
        'filename',
        'uploadedBy',
        'currentStatusId',
        'createdAt',
        'updatedAt',
      ],
    });

    const documentHistory: DocumentHistoryModified[] = [];

    for (const document of documents) {
      const history = await this.documentHistoryRepository.find({
        where: { documentId: document.id },
        order: { createdAt: 'DESC' },
      });

      if (!history || history.length === 0) {
        continue;
      } else {
        for (const entry of history) {
          const changeUser = await this.userService.findOne(entry.changedBy);

          if (!changeUser) {
            throw new NotFoundException(
              `User with id ${entry.changedBy} not found`,
            );
          }

          const transformedHistory: DocumentHistoryModified = {
            id: entry.id,
            documentId: entry.documentId,
            statusId: entry.statusId,
            changedBy: `${changeUser.firstName} ${changeUser.lastName}`,
            comment: entry.comment,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
          };

          documentHistory.push(transformedHistory);
        }
      }
    }

    return documentHistory;
  }

  /**
   * GetFilesHistory
   * ---------------
   * Retrieves the history of all documents.
   *
   * @returns {Promise<DocumentHistoryModified[]>} - An array of document history entries.
   * @throws {NotFoundException} - If a user in the history is not found.
   */
  async getFilesHistory(): Promise<DocumentHistoryModified[]> {
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
        changedBy: `${user.firstName} ${user.lastName}`,
        comment: documentHistory.comment,
        createdAt: documentHistory.createdAt,
        updatedAt: documentHistory.updatedAt,
      };
      transformedsHistory.push(transformedHistory);
    }

    return transformedsHistory;
  }

  /**
   * DownloadFile
   * ------------
   * Downloads a file by its ID.
   *
   * @param {string} id - The ID of the document to download.
   * @param {Response} res - The Express response object.
   * @returns {Promise<StreamableFile>} - A streamable file for download.
   * @throws {NotFoundException} - If the file is not found on disk.
   */
  async downloadFile(id: string, res: Response): Promise<StreamableFile> {
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

  /**
   * StreamFile
   * ----------
   * Streams a file by its ID.
   *
   * @param {string} id - The ID of the document to stream.
   * @returns {Promise<StreamableFile>} - A streamable file for inline viewing.
   * @throws {NotFoundException} - If the file path is not found or the file does not exist on disk.
   */
  async streamFile(id: string): Promise<StreamableFile> {
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

  /**
   * Update
   * ------
   * Updates an existing document with a new file and metadata.
   *
   * @param {string} id - The ID of the document to update.
   * @param {Express.Multer.File} newFile - The new file to upload.
   * @param {string} userEmail - Email of the user updating the file.
   * @param {UpdateFileDto} updateFileDto - DTO containing updated file metadata.
   * @returns {Promise<File>} - The updated document entry.
   * @throws {NotFoundException} - If the document or user is not found.
   * @throws {BadRequestException} - If the document is not in a valid status for updating.
   */
  async update(
    id: string,
    newFile: Express.Multer.File | undefined,
    userEmail: string,
    updateFileDto: UpdateFileDto,
  ): Promise<File> {
    const document = await this.findOne(id);
    const user = await this.userService.findOneByEmail(userEmail);

    if (!user) {
      throw new NotFoundException(`User with email ${userEmail} not found`);
    }

    this.validateDocumentStatus(document);

    if (!newFile) {
      return this.updateMetadataOnly(id, document, user, updateFileDto);
    }

    return this.updateWithNewFile(id, document, user, newFile, updateFileDto);
  }

  /**
   * Validates if document is in a valid status for updating
   * @private
   */
  private validateDocumentStatus(document: File): void {
    const allowedStatuses = [
      DocumentStatus.REJECTED,
      DocumentStatus.PENDING_REVIEW,
    ];

    if (!allowedStatuses.includes(document.currentStatusId as DocumentStatus)) {
      throw new BadRequestException(
        'Document can only be updated if it is in a rejected or pending review status',
      );
    }
  }

  /**
   * Updates only document metadata without changing the file
   * @private
   */
  private async updateMetadataOnly(
    id: string,
    document: File,
    user: any,
    updateFileDto: UpdateFileDto,
  ): Promise<File> {
    const updatedFields: Partial<File> = {};

    if (updateFileDto.name !== undefined) {
      updatedFields.name = updateFileDto.name;
    }

    if (updateFileDto.description !== undefined) {
      updatedFields.description = updateFileDto.description;
    }

    await this.documentRepository.update({ id }, updatedFields);

    const historyEntry = this.documentHistoryRepository.create({
      documentId: id,
      statusId: document.currentStatusId,
      changedBy: user.id,
      comment:
        updateFileDto.comment ??
        `Metadatos actualizados el ${formatFriendlyDate(new Date())}`,
    });

    await this.documentHistoryRepository.save(historyEntry);

    return this.findOne(id);
  }

  /**
   * Updates document with a new file
   * @private
   */
  private async updateWithNewFile(
    id: string,
    document: File,
    user: any,
    newFile: Express.Multer.File,
    updateFileDto: UpdateFileDto,
  ): Promise<File> {
    if (!newFile.path || !existsSync(newFile.path)) {
      throw new BadRequestException('New file not saved properly to disk');
    }

    this.deleteOldFile(document.filePath);

    const { fileBuffer, fileHash } = this.processNewFile(newFile);

    const updateData = this.buildUpdateData(
      newFile,
      fileBuffer,
      fileHash,
      updateFileDto,
    );

    // If the document was rejected, set it to pending review
    const statusId =
      document.currentStatusId === DocumentStatus.REJECTED
        ? DocumentStatus.PENDING_REVIEW
        : document.currentStatusId;

    await this.documentRepository.update({ id }, updateData);

    await this.createHistoryEntry(
      id,
      statusId,
      user.id,
      updateFileDto.comment ??
        `Documento y archivo actualizados el ${formatFriendlyDate(new Date())}`,
    );

    return this.findOne(id);
  }

  /**
   * Deletes old file from disk if it exists
   * @private
   */
  private deleteOldFile(filePath: string | undefined): void {
    if (filePath && existsSync(join(process.cwd(), filePath))) {
      try {
        unlinkSync(join(process.cwd(), filePath));
      } catch (error) {
        console.warn(`Could not delete old file: ${filePath}`, error);
      }
    }
  }

  /**
   * Processes new file and returns buffer and hash
   * @private
   */
  private processNewFile(newFile: Express.Multer.File): {
    fileBuffer: Buffer;
    fileHash: string;
  } {
    try {
      const fileBuffer = readFileSync(newFile.path);
      const fileHash = createHash('sha256').update(fileBuffer).digest('hex');
      return { fileBuffer, fileHash };
    } catch (error) {
      console.error('Error processing new file:', error);
      throw new BadRequestException(
        `Error processing new file: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Builds update data object for document
   * @private
   */
  private buildUpdateData(
    newFile: Express.Multer.File,
    fileBuffer: Buffer,
    fileHash: string,
    updateFileDto: UpdateFileDto,
  ): Partial<File> {
    const updateData: Partial<File> = {
      filePath: newFile.path,
      fileSize: newFile.size,
      mimetype: newFile.mimetype,
      originalFilename: newFile.originalname,
      filename: newFile.filename,
      fileHash: fileHash,
      fileBuffer: fileBuffer,
    };

    if (updateFileDto.name !== undefined) {
      updateData.name = updateFileDto.name;
    }

    if (updateFileDto.description !== undefined) {
      updateData.description = updateFileDto.description;
    }

    return updateData;
  }

  /**
   * Creates a history entry for document changes
   * @private
   */
  private async createHistoryEntry(
    documentId: string,
    statusId: number | string,
    changedBy: string,
    comment: string,
  ): Promise<void> {
    const historyEntry = this.documentHistoryRepository.create({
      documentId,
      statusId: String(statusId),
      changedBy,
      comment,
    });

    await this.documentHistoryRepository.save(historyEntry);
  }

  /**
   * Remove
   * ------
   * Deletes a document and its associated file from disk.
   *
   * @param {string} id - The ID of the document to remove.
   * @returns {Promise<{ id: string, documentName: string }>} - Confirmation of deletion.
   * @throws {NotFoundException} - If the document with the given ID is not found.
   */
  async remove(id: string): Promise<{ id: string; documentName: string }> {
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

  /**
   * ChangeFileStatus
   * ----------------
   * Changes the status of a document and logs the change in history.
   *
   * @param {string} id - The ID of the document to change status.
   * @param {string} statusId - The ID of the new status to set.
   * @param {string} changedBy - Email of the user changing the status.
   * @param {string} [comment] - Optional comment for the status change.
   * @throws {NotFoundException} - If the user or new status is not found.
   */
  async changeFileStatus(
    id: string,
    statusId: string,
    changedBy: string,
    comment?: string,
  ) {
    const document = await this.findOne(id);

    const user = await this.userService.findOneByEmail(changedBy);

    if (!user) {
      throw new NotFoundException(`User with email ${changedBy} not found`);
    }

    const newStatus = await this.documentStatusRepository.findOne({
      where: { id: statusId },
    });

    if (!newStatus) {
      throw new NotFoundException('Status not found');
    }

    // Update state of document
    document.currentStatusId = statusId;

    await this.documentRepository.update({ id }, { currentStatusId: statusId });

    // Create history entry
    const historyEntry = this.documentHistoryRepository.create({
      documentId: document.id,
      statusId: statusId,
      changedBy: user.id,
      comment: comment || `Estado cambiado a: ${newStatus.status}`,
    });

    await this.documentHistoryRepository.save(historyEntry);

    const updatedDocument = await this.findOne(id);

    return {
      ...updatedDocument,
    };
  }

  /**
   * GetFileHistoryById
   * ------------------
   * Retrieves the history of a specific document by its ID.
   *
   * @param {string} id - The ID of the document to retrieve history for.
   * @returns {Promise<{ document: File, history: DocumentHistory[] }>} - An object containing the document and its history.
   * @throws {NotFoundException} - If the document with the given ID is not found.
   */
  async getFileHistoryById(
    id: string,
  ): Promise<{ document: File; history: DocumentHistory[] }> {
    const document = await this.findOne(id);

    const history = await this.documentHistoryRepository.find({
      where: { documentId: id },
      relations: ['status'],
      order: { createdAt: 'DESC' },
    });

    return {
      document,
      history,
    };
  }

  /**
   * GetStatusTypes
   * ---------------
   * Retrieves all available document status types.
   *
   * @returns {Promise<DocumentStatusType[]>} - An array of document status types.
   */
  async getStatusTypes(): Promise<DocumentStatusType[]> {
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

  /**
   * VerifyFileIntegrity
   * -------------------
   * Verifies the integrity of a file by comparing its hash.
   *
   * @param {File} document - The file document to verify.
   * @returns {boolean} - True if the file is intact, false otherwise.
   */
  verifyFileIntegrity(document: File): boolean {
    try {
      if (!document.fileBuffer) {
        console.warn('Document does not have a file buffer to verify');
        return false;
      }

      if (!document.fileHash) {
        console.warn('Document does not have a file hash to compare against');
        return false;
      }

      const currentHash = createHash('sha256')
        .update(document.fileBuffer)
        .digest('hex');

      return currentHash === document.fileHash;
    } catch (error) {
      console.error('Error verifying file integrity:', error);
      throw new InternalServerErrorException('Could not verify file integrity');
    }
  }
}
