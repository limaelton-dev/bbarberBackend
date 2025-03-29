import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class InitialDataSeeder {
  constructor(private dataSource: DataSource) {}

  async run() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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
      `, [adminUser[0].id]);

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
          VALUES (1, $1, $2, $3, $4)
        `, [service.name, service.description, service.price, service.duration]);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
} 