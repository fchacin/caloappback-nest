import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FoodsImage } from "./foods-image.entity";

@Entity()
export class Food {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    title: string;

    @Column('float', {
        default: 0
    })
    Calorias: number;

    @Column({
        type: 'text',
        nullable: true
    })
    Description: string;

    @Column('int', {
        default: 0
    })
    Gramos: number;

    @Column('float')
    Proteina: number


    @OneToMany(
        ()=> FoodsImage,
        (foodsImage)=> foodsImage.food,
        {cascade: true, eager: true}
    )
    images?: FoodsImage[];

}