import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SignatureService } from './signature.service';
import { SignDocumentDto } from './dto/sign-document.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RoleGuard } from '../security/guards/role.guard';
import { Role } from '../common/decorators/role.decorator';
import { UserRole } from '../common/enum/user-role.enum';

@Controller('signature')
@UseGuards(JwtAuthGuard, RoleGuard)
export class SignatureController {
  constructor(private readonly signatureService: SignatureService) {}

  @Post()
  @Role(UserRole.SUPERVISOR)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async signDocument(
    @Body() createSignatureDto: SignDocumentDto,
    @Req() req: Request,
  ) {
    return this.signatureService.signDocument(createSignatureDto, req);
  }

  @Get()
  @Role(UserRole.SUPERVISOR)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async findAll() {
    return await this.signatureService.findAll();
  }

  @Get(':id')
  @Role(UserRole.SUPERVISOR)  
  @UseGuards(JwtAuthGuard, RoleGuard)
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.signatureService.findOne(id);
  }

  @Delete(':id')
  @Role(UserRole.SUPERVISOR)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.signatureService.remove(id);
  }
}
