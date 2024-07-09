import { IsArray, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";


export class CreateFoodDto {

    @IsString()
    @MinLength(1)
    title: string;

    @IsNumber()
    @IsPositive()
    Calorias: number;

    @IsString()
    @IsOptional()
    Description?: string;


    @IsInt()
    @IsPositive()
    Gramos: number;

    @IsNumber()
    @IsPositive()
    Proteina: number

    @IsString({each: true})
    @IsArray()
    @IsOptional()
    images: string[];


    
}
