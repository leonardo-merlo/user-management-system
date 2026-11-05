import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { configureApp } from '../src/app.setup';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { UserController } from '../src/user/user.controller';
import { User } from '../src/user/user.entity';
import { UserService } from '../src/user/user.service';
import { InMemoryUserRepository } from './in-memory-user-repository';

const JWT_SECRET = 'test-secret';

type SignUp = {
  name: string;
  username: string;
  email: string;
  password: string;
};

const alice: SignUp = {
  name: 'Alice',
  username: 'alice',
  email: 'alice@example.com',
  password: 'secret123',
};
const bob: SignUp = {
  name: 'Bob',
  username: 'bob',
  email: 'bob@example.com',
  password: 'secret456',
};

describe('Users API', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          load: [() => ({ JWT_SECRET })],
        }),
        PassportModule,
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [UserController, AuthController],
      providers: [
        UserService,
        AuthService,
        JwtStrategy,
        {
          provide: getRepositoryToken(User),
          useValue: new InMemoryUserRepository(),
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  async function signUp(user: SignUp): Promise<string> {
    const res = await request(app.getHttpServer()).post('/users').send(user);
    return (res.body as { id: string }).id;
  }

  async function tokenFor(user: SignUp): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: user.password });
    return (res.body as { access_token: string }).access_token;
  }

  describe('sign-up', () => {
    it('creates a user without returning the password', async () => {
      const res = await request(app.getHttpServer()).post('/users').send(alice);

      expect(res.status).toBe(201);
      expect(res.body).not.toHaveProperty('password');
    });

    it('rejects an invalid e-mail with 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({ ...alice, email: 'not-an-email' });

      expect(res.status).toBe(400);
    });

    it('answers 409 when the e-mail is already registered', async () => {
      await signUp(alice);

      const res = await request(app.getHttpServer())
        .post('/users')
        .send({ ...bob, email: alice.email });

      expect(res.status).toBe(409);
    });

    it('rejects fields that are not part of the DTO with 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({ ...alice, role: 'admin' });

      expect(res.status).toBe(400);
    });
  });

  describe('login', () => {
    it('returns a token for valid credentials', async () => {
      await signUp(alice);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: alice.email, password: alice.password });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('access_token');
    });

    it('answers 401 for a wrong password', async () => {
      await signUp(alice);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: alice.email, password: 'wrong-password' });

      expect(res.status).toBe(401);
    });

    it('answers 401 for an unknown e-mail', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@example.com', password: 'whatever' });

      expect(res.status).toBe(401);
    });
  });

  describe('protected routes', () => {
    it('answers 401 when listing users without a token', async () => {
      const res = await request(app.getHttpServer()).get('/users');

      expect(res.status).toBe(401);
    });

    it('answers 401 when deleting a user without a token', async () => {
      const id = await signUp(alice);

      const res = await request(app.getHttpServer()).delete(`/users/${id}`);

      expect(res.status).toBe(401);
    });

    it('returns the logged-in user on /users/me', async () => {
      await signUp(alice);
      const token = await tokenFor(alice);

      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ email: alice.email });
    });
  });

  describe('ownership', () => {
    it("answers 403 when a user deletes someone else's account", async () => {
      await signUp(alice);
      const bobId = await signUp(bob);
      const aliceToken = await tokenFor(alice);

      const res = await request(app.getHttpServer())
        .delete(`/users/${bobId}`)
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(403);
    });

    it("answers 403 when a user updates someone else's account", async () => {
      await signUp(alice);
      const bobId = await signUp(bob);
      const aliceToken = await tokenFor(alice);

      const res = await request(app.getHttpServer())
        .put(`/users/${bobId}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ name: 'Hacked' });

      expect(res.status).toBe(403);
    });

    it('lets a user delete their own account', async () => {
      const aliceId = await signUp(alice);
      const aliceToken = await tokenFor(alice);

      const res = await request(app.getHttpServer())
        .delete(`/users/${aliceId}`)
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(204);
    });

    it('rejects the token of a deleted user with 401', async () => {
      const aliceId = await signUp(alice);
      const aliceToken = await tokenFor(alice);
      await request(app.getHttpServer())
        .delete(`/users/${aliceId}`)
        .set('Authorization', `Bearer ${aliceToken}`);

      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(res.status).toBe(401);
    });
  });
});
