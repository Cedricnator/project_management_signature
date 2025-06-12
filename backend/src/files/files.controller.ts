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
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('files')
@UseGuards(JwtAuthGuard, RoleGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard, RoleGuard)
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.filesService.uploadFile(file, uploadFileDto, user.email);
  }

  @Post('stream')
  @UseGuards(JwtAuthGuard, RoleGuard)
  streamFile(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.filesService.streamFile(id);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard, RoleGuard)
  downloadFile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.filesService.downloadFile(id, res);
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  findFilesByUser(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.filesService.findFilesByUser(userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.filesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard, RoleGuard)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateFileDto: UpdateFileDto,
  ) {
    return this.filesService.update(id, file, updateFileDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.filesService.remove(id);
  }

  @Get(':id/history')
  @UseGuards(JwtAuthGuard, RoleGuard)
  getFileHistory(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.filesService.getFileHistory(id);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard, RoleGuard)
  findAllStatusTypes() {
    return this.filesService.getStatusTypes();
  }
}
