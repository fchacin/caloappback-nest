import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Food } from "./food.entity";

@Entity()
export class FoodsImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  @ManyToOne(
    ()=> Food,
    (food)=> food.images,
    {onDelete: 'CASCADE'}
  )
  food: Food;


}