import { Injectable } from "@nestjs/common";
import { UserRepository } from "../repositories/user.repository";
import { UserEntity } from "../entities/user.entity";

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
    ) {}

    async findById(id: number): Promise<UserEntity | null> {
        return this.userRepository.findById(id);
    }

    //Funções aqui
}