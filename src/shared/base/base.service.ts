import { Repository, FindOptionsWhere, DeepPartial } from 'typeorm';
import { BaseEntity } from './base.entity';
import { NotFoundException } from '@nestjs/common';

export abstract class BaseService<T extends BaseEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async findOne(where: FindOptionsWhere<T>): Promise<T> {
    const entity = await this.repository.findOne({ where });
    if (!entity) {
      throw new NotFoundException();
    }
    return entity;
  }

  async findAll(where?: FindOptionsWhere<T>): Promise<T[]> {
    return await this.repository.find({ where });
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    await this.repository.update(id, data as any);
    return await this.findOne({ id } as FindOptionsWhere<T>);
  }

  async delete(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException();
    }
  }
} 