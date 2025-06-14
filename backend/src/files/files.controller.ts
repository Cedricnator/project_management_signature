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
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ChangeFileStatusDto } from './dto/change-status.dto';

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
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.filesService.uploadFile(file, uploadFileDto, user.email);
  }

  @Post('stream')
  streamFile(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.streamFile(id);
  }

  @Get('history')
  getAllFileHistory() {
    return this.filesService.getFilesHistory();
  }

  @Get('status')
  findAllStatusTypes() {
    return this.filesService.getStatusTypes();
  }

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get('users/:id')
  findFilesByUser(@Param('id', ParseUUIDPipe) userId: string) {
    return this.filesService.findFilesByUser(userId);
  }

  @Get('users/:id/history')
  getUserFileHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.getFileHistoryByUserId(id);
  }

  @Get(':id/download')
  downloadFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.filesService.downloadFile(id, res);
  }

  @Get(':id/history')
  getFileHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.getFileHistoryById(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
    @Body() updateFileDto: UpdateFileDto,
  ) {
    return this.filesService.update(id, file, user.email, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.remove(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async changeFileStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changeFileStatusDto: ChangeFileStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.filesService.changeFileStatus(
      id, 
      changeFileStatusDto.statusId, 
      user.email, 
      changeFileStatusDto.comment,
    );
  }
}
