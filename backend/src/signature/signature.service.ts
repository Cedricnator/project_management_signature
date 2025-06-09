import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignDocumentDto } from './dto/sign-document.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountDocument } from './entities/account-document.entity';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { FilesService } from '../files/files.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enum/user-role.enum';

@Injectable()
export class SignatureService {
  constructor(
    @InjectRepository(AccountDocument)
    private readonly accountDocumentRepository: Repository<AccountDocument>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly filesService: FilesService,
  ) {}

  private async validateDocumentForSigning(documentId: string, userId: string) {
    const document = await this.filesService.findOne(documentId);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.isActive) {
      return { isValid: false, message: 'User not found or inactive' };
    }

    if (user.role !== UserRole.SUPERVISOR) {
      return { isValid: false, message: 'User is not a supervisor' };
    }

    const pendingReviewStatus = '01974b23-bc2f-7e5f-a9d0-73a5774d2778';

    if (document.currentStatusId !== pendingReviewStatus) {
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
        accountId: userId,
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
      user,
    };
  }

  async signDocument(signDocumentDto: SignDocumentDto, req: Request) {
    const { documentId, comment, userId } = signDocumentDto;

    // Make all verifications before proceeding
    const validationResult = await this.validateDocumentForSigning(
      documentId,
      userId,
    );

    if (!validationResult.isValid) {
      throw new BadRequestException(validationResult.message);
    }
    const { document, user } = validationResult;

    const signatureData = {
      documentId,
      userId,
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
      accountId: userId,
      validated: true,
      validatedAt: new Date(),
      signatureHash: signatureHash,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });
    const signature = await this.accountDocumentRepository.save(newSignature);

    await this.filesService.changeFileStatus(
      documentId,
      '01974b23-fecc-7863-b7ac-b64554d34cde', // 'signed' status ID
      `Document signed by supervisor: ${user!.email}`,
      userId,
    );

    return {
      message: 'Document signed successfully',
      signatureHash: signatureHash,
      signedAt: signature.validatedAt,
      signer: {
        id: user!.id,
        email: user!.email,
        firstName: user!.firstName,
        lastName: user!.lastName,
        role: user!.role,
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
