// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
function getEnv(key: string, config: ConfigService): string {
  const value = config.get(key) as string;
  if (!value) throw new Error(`Missing env var ${key}`);
  return value;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = getEnv('DB_HOST', configService);
        const port = Number(getEnv('DB_PORT', configService));
        const username = getEnv('DB_USERNAME', configService);
        const password = getEnv('DB_PASSWORD', configService);
        const database = getEnv('DB_NAME', configService);
        const synchronize = getEnv('DB_SYNC', configService) === 'true';
        const logging = getEnv('DB_LOGGING', configService) === 'true';

        return {
          type: 'mysql' as const,
          host,
          port,
          username,
          password,
          database,
          entities: [User],
          synchronize,
          logging,
        };
      },
    }),
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
