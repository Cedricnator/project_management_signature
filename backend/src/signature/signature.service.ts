import { Injectable } from '@nestjs/common';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { UpdateSignatureDto } from './dto/update-signature.dto';

@Injectable()
export class SignatureService {
  create(createSignatureDto: CreateSignatureDto) {
    return 'This action adds a new signature';
  }

  findAll() {
    return `This action returns all signature`;
  }

  findOne(id: number) {
    return `This action returns a #${id} signature`;
  }

  update(id: number, updateSignatureDto: UpdateSignatureDto) {
    return `This action updates a #${id} signature`;
  }

  remove(id: number) {
    return `This action removes a #${id} signature`;
  }
}
