import { IsArray, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateExerciseDto {

    @IsString()
    @MinLength(1)
    title: string;

    @IsString()
    @IsOptional()
    Explain: string;

    @IsString()
    @IsOptional()
    GrupoMuscular: string;

    @IsInt()
    @IsPositive()
    Series: number;

    @IsNumber()
    @IsPositive()
    Repeticiones: number

    @IsString({each: true})
    @IsArray()
    @IsOptional()
    images: string[];

}
