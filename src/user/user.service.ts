import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export type PublicUser = Omit<User, 'password'>;

function withoutPassword(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
  };
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(data: CreateUserDto): Promise<PublicUser> {
    // The unique indexes on email and username are the real guarantee; this
    // check turns the common case into a 409 instead of a database error.
    const taken = await this.userRepository.findOne({
      where: [{ email: data.email }, { username: data.username }],
    });
    if (taken) {
      throw new ConflictException('E-mail or username already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const saved = await this.userRepository.save(user);
    return withoutPassword(saved);
  }

  async findAll(): Promise<PublicUser[]> {
    const users = await this.userRepository.find();
    return users.map(withoutPassword);
  }

  async findOne(id: string): Promise<PublicUser> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return withoutPassword(user);
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<PublicUser> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    await this.userRepository.update(id, data);

    const updated = await this.userRepository.findOne({ where: { id } });
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return withoutPassword(updated);
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}
