import { IsString, MinLength } from 'class-validator';

export class KeywordDto {
    @IsString()
    @MinLength(1)
    keyword: string;
}