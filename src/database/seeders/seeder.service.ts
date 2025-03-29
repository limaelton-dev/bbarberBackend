import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService {
  constructor(private readonly dataSource: DataSource) {}

  async seed() {
    await this.seedUsers();
    await this.seedServices();
  }

  async seedUsers() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar se já existem usuários
      const userCount = await queryRunner.query(
        'SELECT COUNT(*) as count FROM "user"'
      );
      
      if (parseInt(userCount[0].count) > 0) {
        console.log('Usuários já existem, pulando seeder...');
        await queryRunner.commitTransaction();
        return;
      }

      // Criar usuário admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = await queryRunner.query(`
        INSERT INTO "user" (email, password)
        VALUES ('admin@bbarber.com', $1)
        RETURNING id
      `, [hashedPassword]);

      // Criar perfil admin
      await queryRunner.query(`
        INSERT INTO profile (user_id, type, full_name)
        VALUES ($1, 'barbershop', 'Administrador do Sistema')
        RETURNING id
      `, [adminUser[0].id]);

      console.log('Usuário admin criado com sucesso');
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async seedServices() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar se já existem serviços
      const serviceCount = await queryRunner.query(
        'SELECT COUNT(*) as count FROM service'
      );
      
      if (parseInt(serviceCount[0].count) > 0) {
        console.log('Serviços já existem, pulando seeder...');
        await queryRunner.commitTransaction();
        return;
      }

      // Verificar a primeira barbearia
      const barbershops = await queryRunner.query(
        'SELECT id FROM barbershop LIMIT 1'
      );
      
      if (barbershops.length === 0) {
        console.log('Nenhuma barbearia encontrada, criando uma...');
        
        // Criar barbearia de exemplo
        const barbershop = await queryRunner.query(`
          INSERT INTO barbershop (profile_id, name, description)
          VALUES (
            (SELECT id FROM profile WHERE type = 'barbershop' LIMIT 1),
            'Barbearia Exemplo',
            'Uma barbearia de exemplo para testes'
          )
          RETURNING id
        `);
        
        // Criar serviços básicos
        const basicServices = [
          { name: 'Corte de Cabelo', description: 'Corte masculino tradicional', price: 35.00, duration: 30 },
          { name: 'Barba', description: 'Aparar e modelar a barba', price: 25.00, duration: 20 },
          { name: 'Corte + Barba', description: 'Combo corte masculino e barba', price: 55.00, duration: 45 },
          { name: 'Pigmentação', description: 'Pigmentação de barba ou cabelo', price: 45.00, duration: 40 },
          { name: 'Hidratação', description: 'Hidratação capilar', price: 40.00, duration: 30 }
        ];

        for (const service of basicServices) {
          await queryRunner.query(`
            INSERT INTO service (barbershop_id, name, description, price, duration)
            VALUES ($1, $2, $3, $4, $5)
          `, [barbershop[0].id, service.name, service.description, service.price, service.duration]);
        }
      } else {
        // Criar serviços para a barbearia existente
        const barbershopId = barbershops[0].id;
        const basicServices = [
          { name: 'Corte de Cabelo', description: 'Corte masculino tradicional', price: 35.00, duration: 30 },
          { name: 'Barba', description: 'Aparar e modelar a barba', price: 25.00, duration: 20 },
          { name: 'Corte + Barba', description: 'Combo corte masculino e barba', price: 55.00, duration: 45 },
          { name: 'Pigmentação', description: 'Pigmentação de barba ou cabelo', price: 45.00, duration: 40 },
          { name: 'Hidratação', description: 'Hidratação capilar', price: 40.00, duration: 30 }
        ];

        for (const service of basicServices) {
          await queryRunner.query(`
            INSERT INTO service (barbershop_id, name, description, price, duration)
            VALUES ($1, $2, $3, $4, $5)
          `, [barbershopId, service.name, service.description, service.price, service.duration]);
        }
      }

      console.log('Serviços criados com sucesso');
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
} 