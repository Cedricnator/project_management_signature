import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const users: User[] = [
  {
    userId: 1,
    userName: 'admin',
    password: 'admin',
    role: 'admin',
  },
  {
    userId: 2,
    userName: 'user',
    password: 'user',
    role: 'user',
  },
];

@Injectable()
export class UsersService {
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return users;
  }

  findOne(id: number) {
    return users.find((user) => user.userId === id);
  }

  async findByName(userName: string) {
    return users.find((user) => user.userName === userName);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
