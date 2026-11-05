import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

type AuthenticatedRequest = { user: Omit<User, 'password'> };

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Sign-up stays public; every other route needs a valid token.
  @Post()
  create(@Body() data: CreateUserDto) {
    return this.userService.createUser(data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Request() req: AuthenticatedRequest) {
    return this.userService.findOne(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('me')
  updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() data: UpdateUserDto,
  ) {
    return this.userService.updateUser(req.user.id, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    assertSelf(req, id);
    return this.userService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateUserDto,
  ) {
    assertSelf(req, id);
    return this.userService.updateUser(id, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    assertSelf(req, id);
    return this.userService.deleteUser(id);
  }
}

// There are no roles yet, so a user may only read, change or delete their own
// record. An admin role would be the place to relax this.
function assertSelf(req: AuthenticatedRequest, id: string): void {
  if (req.user.id !== id) {
    throw new ForbiddenException('You can only access your own account');
  }
}
