import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ExcercisesImage } from "./exercise-image.entity";

@Entity()
export class Exercise {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    title: string;

    @Column({
        type: 'text',
        nullable: true
    })
    Explain: string;

    @Column({
        type: 'text',
        nullable: true
    })
    GrupoMuscular: string;

    @Column('int', {
        default: 0
    })
    Series: number;

    @Column('float', {
        default: 0
    })
    Repeticiones: number;

    @OneToMany(
        ()=> ExcercisesImage,
        (exercisesImages)=> exercisesImages.exercise,
        {cascade: true, eager: true}
    )
    images?: ExcercisesImage[];

}