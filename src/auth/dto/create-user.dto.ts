import { IsEmail, IsInt, IsOptional, IsPositive, IsString, Matches, MaxLength, MinLength, IsArray} from "class-validator";

export class CreateUserDto{
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
    /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;

    @IsString()
    @MinLength(1)
    fullName: string;
    
    @IsInt()
    @IsPositive()
    @IsOptional()
    Edad?: number; 

    @IsInt()
    @IsPositive()
    @IsOptional()
    Peso?: number; 

    @IsInt()
    @IsPositive()
    @IsOptional()
    Altura?: number; 

    @IsString()
    @MinLength(1)
    Actividad: string;

    @IsString()
    @MinLength(1)
    Objetivo: string;

    @IsString()
    @MinLength(1)
    Nivel: string;

    @IsString({each: true})
    @IsArray()
    @IsOptional()
    images: string[];

    @IsString()
    @MinLength(1)
    keyword: string;

}