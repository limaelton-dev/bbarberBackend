import { BaseEntity, Column, Entity } from 'typeorm';

@Entity('user')
export class UserEntity extends BaseEntity {
    @Column({ unique: true })
    email: string;

    @Column({})
    password: string;

}