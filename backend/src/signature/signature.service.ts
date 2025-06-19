import {
  BadRequestException,
  Injectable,
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
  constructor(
    @InjectRepository(SignDocument)
    private readonly accountDocumentRepository: Repository<SignDocument>,
    private readonly filesService: FilesService,
    private readonly userService: UsersService,
  ) {}

  private async validateDocumentForSigning(documentId: string, user: any) {
    const document = await this.filesService.findDocumentWithBuffer(documentId);

    if (!user) {
      return { isValid: false, message: 'User not found' };
    }

    if (user.role !== UserRole.SUPERVISOR) {
      return { isValid: false, message: 'User is not a supervisor' };
    }

    if (document.currentStatusId !== DocumentStatus.PENDING_REVIEW) {
      return {
        isValid: false,
        message: 'Document is not in a valid status for signing',
      };
    }

    const fileIntegrity = this.filesService.verifyFileIntegrity(document);
    if (!fileIntegrity) {
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
      return {
        isValid: false,
        message: 'You have already signed this document',
      };
    }

    return {
      isValid: true,
      document,
    };
  }

  async signDocument(signDocumentDto: SignDocumentDto, userEmail: string, req: Request) {
    const user = await this.userService.findByEmail(userEmail);

    const { documentId, comment } = signDocumentDto;

    // Make all verifications before proceeding
    const validationResult = await this.validateDocumentForSigning(
      documentId,
      user,
    );

    if (!validationResult.isValid) {
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
    
    const signature = await this.accountDocumentRepository.save(newSignature);

    await this.filesService.changeFileStatus(   
      documentId,
      DocumentStatus.APPROVED,
      user.email,
      comment || `Documento firmado por: ${user.email}`
    );

    const updatedDocument = await this.filesService.findOne(documentId);
    const { fileBuffer, ...rest } = updatedDocument;

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
    return await this.accountDocumentRepository.find();
  }

  async verifySignatureIntegrity(signatureId: string): Promise<boolean> {
    try {
      const signature = await this.findOne(signatureId);
      const document = await this.filesService.findOne(signature.documentId);
 
      // Verify if the document not has been modified
      const isFileValid = this.filesService.verifyFileIntegrity(document);
      if (!isFileValid) {
        console.warn(
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
      console.error('Error verifying signature integrity:', error);
      return false;
    }
  }

  async findOne(id: string) {
    const signature = await this.accountDocumentRepository.findOne({
      where: { id },
      relations: ['account', 'document'],
    });

    if (!signature) {
      throw new NotFoundException(`Signature with ID ${id} not found`);
    }

    return signature;
  }

  async remove(id: string) {
    const signature = await this.findOne(id);
    if (!signature) {
      throw new NotFoundException(`Signature with ID ${id} not found`);
    }
    const deletedSignature =
      await this.accountDocumentRepository.remove(signature);

    return {
      message: `Signature with ID ${id} has been deleted successfully`,
      deletedSignature,
    };
  }
}
