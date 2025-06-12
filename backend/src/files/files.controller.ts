import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadFileDto } from './dto/upload-file.dto';
import { RoleGuard } from '../security/guards/role.guard';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from 'jsonwebtoken';

@Controller('files')
@UseGuards(JwtAuthGuard, RoleGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
    @CurrentUser() user: JwtPayload,
  ) {
    console.log('Current User:', user);
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.filesService.uploadFile(file, uploadFileDto);
  }

  @Post('stream')
  streamFile(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.filesService.streamFile(id);
  }

  @Get(':id/download')
  downloadFile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.filesService.downloadFile(id, res);
  }

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.filesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateFileDto: UpdateFileDto,
  ) {
    return this.filesService.update(id, file, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.filesService.remove(id);
  }

  @Get(':id/history')
  getFileHistory(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.filesService.getFileHistory(id);
  }

  @Get('status')
  findAllStatusTypes() {
    return this.filesService.getStatusTypes();
  }
}
