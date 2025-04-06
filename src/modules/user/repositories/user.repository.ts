import { Injectable } from "@nestjs/common";
import { Repository, FindOneOptions } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";

@Injectable()
export class UserRepository{
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRpository: Repository<UserEntity>,
    ) {}

    async findById(id: number): Promise<UserEntity | null> {
        return this.userRpository.findOne({ where: { id } });
    }

    async findOne(options: FindOneOptions<UserEntity>): Promise<UserEntity | null> {
        return this.userRpository.findOne(options);
    }
}