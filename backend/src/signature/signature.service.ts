import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SignDocumentDto } from './dto/sign-document.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SignDocument } from './entities/account-document.entity';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { FilesService } from '../files/files.service';
import { UserRole } from '../common/enum/user-role.enum';
import { DocumentStatus } from '../files/enum/document-status.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class SignatureService {
  private readonly logger = new Logger(SignatureService.name);

  constructor(
    @InjectRepository(SignDocument)
    private readonly accountDocumentRepository: Repository<SignDocument>,
    private readonly filesService: FilesService,
    private readonly userService: UsersService,
  ) {}

  private async validateDocumentForSigning(documentId: string, user: any) {
    this.logger.log(`Validating document for signing: ${documentId} by user: ${user?.email}`);
    const document = await this.filesService.findDocumentWithBuffer(documentId);

    if (!user) {
      this.logger.warn(`User not found for email: ${user?.email}`);
      return { isValid: false, message: 'User not found' };
    }

    if (user.role !== UserRole.SUPERVISOR) {
      this.logger.warn(`User with email ${user.email} is not a supervisor`);
      return { isValid: false, message: 'User is not a supervisor' };
    }

    if (document.currentStatusId !== DocumentStatus.PENDING_REVIEW) {
      this.logger.warn(
        `Document with ID ${documentId} is not in a valid status for signing: ${document.currentStatusId}`,
      );
      return {
        isValid: false,
        message: 'Document is not in a valid status for signing',
      };
    }

    const fileIntegrity = this.filesService.verifyFileIntegrity(document);
    if (!fileIntegrity) {
      this.logger.warn(`File integrity check failed for document with ID: ${documentId}`);
      return {
        isValid: false,
        message: 'Document integrity check failed',
      };
    }

    const existingSignature = await this.accountDocumentRepository.findOne({
      where: {
        documentId: documentId,
        accountId: user.id,
      },
    });

    if (existingSignature) {
      this.logger.warn(`User ${user.email} has already signed document with ID: ${documentId}`);
      return {
        isValid: false,
        message: 'You have already signed this document',
      };
    }

    this.logger.log(`Document with ID ${documentId} is valid for signing by user: ${user.email}`);
    return {
      isValid: true,
      document,
    };
  }

  async signDocument(signDocumentDto: SignDocumentDto, userEmail: string, req: Request) {
    this.logger.log(`Signing document with ID: ${signDocumentDto.documentId} for user: ${userEmail}`);
    const user = await this.userService.findByEmail(userEmail);

    const { documentId, comment } = signDocumentDto;

    // Make all verifications before proceeding
    const validationResult = await this.validateDocumentForSigning(
      documentId,
      user,
    );

    if (!validationResult.isValid) {
      this.logger.warn(`Validation failed for document ID: ${documentId} - ${validationResult.message}`);
      throw new BadRequestException(validationResult.message);
    }
    const { document } = validationResult;

    const signatureData = {
      documentId,
      userId: user.id,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      comment,
      originalFileHash: document?.fileHash,
    };

    const signatureHash = createHash('sha256')
      .update(JSON.stringify(signatureData))
      .digest('hex');

    // Create new signature
    const newSignature = this.accountDocumentRepository.create({
      documentId: documentId,
      accountId: user.id,
      validated: true,
      validatedAt: new Date(),
      signatureHash: signatureHash,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });

    this.logger.log(`Creating new signature for document ID: ${documentId} by user: ${user.email}`);
    const signature = await this.accountDocumentRepository.save(newSignature);

    await this.filesService.changeFileStatus(   
      documentId,
      DocumentStatus.APPROVED,
      user.email,
      comment || `Documento firmado por: ${user.email}`
    );

    const updatedDocument = await this.filesService.findOne(documentId);
    const { fileBuffer, ...rest } = updatedDocument;
  
    this.logger.log(`Signature created successfully for document ID: ${documentId} by user: ${user.email}`);
    return {
      ...rest,
      signatureHash: signatureHash,
      signedAt: signature.validatedAt,
      signer: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async findAll() {
  this.logger.log('Fetching all signatures');
    return await this.accountDocumentRepository.find();
  }

  async verifySignatureIntegrity(signatureId: string): Promise<boolean> {
    try {
      this.logger.log(`Verifying integrity of signature with ID: ${signatureId}`);
      const signature = await this.findOne(signatureId);
      const document = await this.filesService.findOne(signature.documentId);
 
      // Verify if the document not has been modified
      const isFileValid = this.filesService.verifyFileIntegrity(document);
      if (!isFileValid) {
        this.logger.warn(
          `Signature ${signatureId} is invalid - file has been modified`,
        );
        return false;
      }

      // Recreate the original signature data
      const originalSignatureData = {
        documentId: signature.documentId,
        userId: signature.accountId,
        timestamp: signature.validatedAt.toISOString(),
        userAgent: signature.userAgent,
        ipAddress: signature.ipAddress,
        originalFileHash: document.fileHash,
      };

      const expectedHash = createHash('sha256')
        .update(JSON.stringify(originalSignatureData))
        .digest('hex');
      
      return expectedHash === signature.signatureHash;
    } catch (error) {
      this.logger.error('Error verifying signature integrity:', error);
      return false;
    }
  }

  async findOne(id: string) {
    this.logger.log(`Fetching signature with ID: ${id}`);
    const signature = await this.accountDocumentRepository.findOne({
      where: { id },
      relations: ['account', 'document'],
    });

    if (!signature) {
      this.logger.warn(`Signature with ID ${id} not found`);
      throw new NotFoundException(`Signature with ID ${id} not found`);
    }

  this.logger.log(`Signature with ID ${id} found successfully`);
    return signature;
  }

  async remove(id: string) {
    this.logger.log(`Deleting signature with ID: ${id}`);
    const signature = await this.findOne(id);

    if (!signature) {
      this.logger.warn(`Signature with ID ${id} not found for deletion`);
      throw new NotFoundException(`Signature with ID ${id} not found`);
    }

    const deletedSignature =
      await this.accountDocumentRepository.remove(signature);
      
    this.logger.log(`Signature with ID ${id} deleted successfully`);
    return {
      message: `Signature with ID ${id} has been deleted successfully`,
      deletedSignature,
    };
  }
}
