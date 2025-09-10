import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // obtém a instância subjacente (Express/Fastify) e registra rotas simples
  const server = app.getHttpAdapter().getInstance() as any;

  // rota raiz
  server.get('/', (req: any, res: any) => {
    res.json({ message: 'API is running 🚀' });
  });

  // rota health
  server.get('/health', (req: any, res: any) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
    });
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
