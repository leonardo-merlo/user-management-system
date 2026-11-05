import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

describe('AuthService.validateUser', () => {
  const stored: User = {
    id: '6f1c1c2e-0000-4000-8000-000000000001',
    name: 'Alice',
    username: 'alice',
    email: 'alice@example.com',
    password: bcrypt.hashSync('secret123', 4),
  };

  function serviceWith(user: User | null): AuthService {
    const users = { findByEmail: () => Promise.resolve(user) };
    return new AuthService(
      users as unknown as UserService,
      new JwtService({ secret: 'test-secret' }),
    );
  }

  it('returns id and e-mail when the password matches the bcrypt hash', async () => {
    const result = await serviceWith(stored).validateUser(
      stored.email,
      'secret123',
    );

    expect(result).toEqual({ id: stored.id, email: stored.email });
  });

  it('returns null when the password does not match', async () => {
    const result = await serviceWith(stored).validateUser(
      stored.email,
      'wrong-password',
    );

    expect(result).toBeNull();
  });

  it('returns null when the e-mail is unknown', async () => {
    const result = await serviceWith(null).validateUser(
      'nobody@example.com',
      'secret123',
    );

    expect(result).toBeNull();
  });
});
