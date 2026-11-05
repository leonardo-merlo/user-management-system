import { INestApplication, ValidationPipe } from '@nestjs/common';

// Shared by main.ts and the HTTP tests, so the tests run the same validation
// the real server does.
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
}
