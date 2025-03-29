import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule, {
    logger: ['error', 'warn', 'log']
  });

  try {
    const seederService = app.get(SeederService);
    console.log('Iniciando os seeders...');
    await seederService.seed();
    console.log('Seeders executados com sucesso!');
  } catch (error) {
    console.error('Erro ao executar os seeders:', error);
    throw error;
  } finally {
    await app.close();
  }
}

bootstrap(); 