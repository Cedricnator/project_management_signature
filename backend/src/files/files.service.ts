import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { UpdateFileDto } from './dto/update-file.dto';
import { join } from 'path';
import { createReadStream, existsSync, unlinkSync } from 'fs';
import { v7 } from 'uuid';
import { Response } from 'express';

export interface FileRecord {
  id: string;
  originalName: string;
  size: number;
  mimetype: string;
  filename: string;
  path: string;
  uploadedAt: Date;
}

@Injectable()
export class FilesService {
  private readonly uploadPath = './uploads';
  private files: FileRecord[] = [];

  uploadFile(file: Express.Multer.File) {
    const file_record: FileRecord = {
      id: v7(),
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      filename: file.filename,
      path: file.path,
      uploadedAt: new Date(),
    };

    this.files.push(file_record);
    return { file_record };
  }

  findAll() {
    return this.files.map((file) => ({
      id: file.id,
      originalName: file.originalName,
      size: file.size,
      mimetype: file.mimetype,
      filename: file.filename,
    }));
  }

  downloadFile(id: string, res: Response) {
    const file = this.findOne(id);
    const filePath = join(process.cwd(), file.path);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.originalName}"`,
    );
    res.setHeader('Content-Type', file.mimetype);
    const fileStream = createReadStream(filePath);
    return new StreamableFile(fileStream);
  }

  findOne(id: string): FileRecord {
    const file = this.files.find((f) => f.id === id);
    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }
    return file;
  }

  streamFile(id: string) {
    const file = this.findOne(id);

    const filePath = join(process.cwd(), file.path);
    if (!existsSync(filePath)) {
      throw new NotFoundException(`File not found on disk: ${filePath}`);
    }
    const fileStream = createReadStream(filePath);
    return new StreamableFile(fileStream, {
      type: file.mimetype,
      disposition: `inline; filename="${file.originalName}"`,
    });
  }

  update(
    id: string,
    newFile: Express.Multer.File,
    updateFileDto?: UpdateFileDto,
  ) {
    const existingFile = this.findOne(id);
    const existingFileIndex = this.files.findIndex((f) => f.id === id);

    const oldFilePath = join(process.cwd(), existingFile.path);
    if (existsSync(oldFilePath)) {
      try {
        unlinkSync(oldFilePath);
      } catch (error) {
        console.warn(`Could not delete old file: ${oldFilePath}`, error);
      }
    }

    const updatedFileRecord: FileRecord = {
      id: existingFile.id,
      originalName: newFile.originalname,
      size: newFile.size,
      mimetype: newFile.mimetype,
      filename: newFile.filename,
      path: newFile.path,
      uploadedAt: new Date(),
    };

    this.files[existingFileIndex] = updatedFileRecord;

    return {
      file: updatedFileRecord,
    };
  }

  remove(id: string) {
    const file = this.findOne(id);
    const existingFileIndex = this.files.findIndex((f) => f.id === id);

    // Eliminar archivo físico
    const filePath = join(process.cwd(), file.path);
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath);
      } catch (error) {
        console.warn(`Could not delete file: ${filePath}`, error);
      }
    }

    // Eliminar del array
    this.files.splice(existingFileIndex, 1);

    return {
      deletedFile: {
        id: file.id,
        originalName: file.originalName,
      },
    };
  }
}
