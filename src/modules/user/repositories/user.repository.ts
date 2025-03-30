import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";

@Injectable()
export class UserRepository{
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRpository: Repository<UserEntity>,
    ) {}
}