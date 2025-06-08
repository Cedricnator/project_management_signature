import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { SignatureService } from './signature.service';
import { SignDocumentDto } from './dto/sign-document.dto';
import { Request } from 'express';

@Controller('signature')
export class SignatureController {
  constructor(private readonly signatureService: SignatureService) {}

  @Post()
  async signDocument(
    @Body() createSignatureDto: SignDocumentDto,
    @Req() req: Request,
  ) {
    return this.signatureService.signDocument(createSignatureDto, req);
  }

  @Get()
  async findAll() {
    return await this.signatureService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.signatureService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.signatureService.remove(id);
  }
}
