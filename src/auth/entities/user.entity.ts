import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserImage } from "./user-image.entity";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    email: string;

    @Column('text',
        {select: false}
    )
    password: string;
    
    @Column('text')
    fullName: string;

    @Column('bool', {
        default: true
    })
    isActive: boolean;
    
    @Column('text', {
        array:true,
        default:['user']
    })
    roles: string[];

    @Column('int',{
        default: 0
    })
    Edad: number;

    @Column('int',{
        default: 0
    })
    Peso: number;

    @Column('float',{
        default: 0
    })
    Altura: number;

    @Column('text',{
        default: 'Sedentario'
    })
    Actividad: string;

    @Column('text',{
        default: 'Aumento'
    })
    Objetivo: string;

    @Column('text',{
        default: 'Principiante'
    })
    Nivel: string;

    @Column('text', {
        default: 'default_keyword'
    })
    keyword: string;

    @OneToMany(
        () => UserImage,
        (userImage) => userImage.user,
        {cascade: true, eager: true}
    )
    images?: UserImage[];

    @BeforeInsert()
    checkFieldsBeforeInsert(){
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate(){
        this.checkFieldsBeforeInsert();
    }

}
