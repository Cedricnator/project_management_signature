import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignDocumentDto } from './dto/sign-document.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountDocument } from './entities/account-document.entity';
import { User } from 'src/users/entities/user.entity';
import { FilesService } from 'src/files/files.service';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { UserRole } from 'src/users/entities/user-role.enum';

@Injectable()
export class SignatureService {
  constructor(
    @InjectRepository(AccountDocument)
    private readonly accountDocumentRepository: Repository<AccountDocument>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly filesService: FilesService,
  ) {}

  async signDocument(signDocumentDto: SignDocumentDto, req: Request) {
    const { documentId, comment, userId } = signDocumentDto;

    // verify if document exists
    await this.filesService.findOne(documentId);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.SUPERVISOR) {
      throw new UnauthorizedException(
        'You are not authorized to sign documents',
      );
    }

    const existingSignature = await this.accountDocumentRepository.findOne({
      where: {
        documentId: documentId,
        accountId: userId,
      },
    });

    if (existingSignature?.validated) {
      throw new BadRequestException('You have already signed this document');
    }

    const signatureData = {
      documentId,
      userId,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      comment,
    };

    const signatureHash = createHash('sha256')
      .update(JSON.stringify(signatureData))
      .digest('hex');

    let signature: AccountDocument;

    if (existingSignature) {
      // Update existing signature
      existingSignature.validated = true;
      existingSignature.validatedAt = new Date();
      existingSignature.signatureHash = signatureHash;
      existingSignature.ipAddress = req.ip || '';
      existingSignature.userAgent = req.headers['user-agent'] || '';
      signature = await this.accountDocumentRepository.save(existingSignature);
    } else {
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
      signature = await this.accountDocumentRepository.save(newSignature);
    }

    await this.filesService.changeFileStatus(
      documentId,
      'signed',
      `Document signed by supervisor: ${user.email}`,
      userId,
    );

    return {
      message: 'Document signed successfully',
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

  async findOne(id: string) {
    const signature = await this.accountDocumentRepository.findOne({
      where: { id },
      // relations: ['account', 'document'],
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
