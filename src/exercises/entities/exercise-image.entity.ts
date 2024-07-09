import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Exercise } from "./exercise.entity";

@Entity()
export class ExcercisesImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  @ManyToOne(
    ()=> Exercise,
    (exercise)=> exercise.images,
    {onDelete: 'CASCADE'}
  )
  exercise: Exercise;



}