import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../shared/base/base.entity';

@Entity('user')
export class UserEntity extends BaseEntity {
    @Column({ unique: true })
    email: string;

    @Column({})
    password: string;
}