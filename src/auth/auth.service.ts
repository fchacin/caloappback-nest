import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/upadte-user.dto';
import { isUUID } from 'class-validator';
import { UserImage } from './entities/user-image.entity';
import { KeywordDto } from './dto/keyword.dto';


@Injectable()
export class AuthService {
  
    constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      private readonly jwtService: JwtService,
      private readonly dataSource: DataSource,

      @InjectRepository(UserImage)
      private readonly userImageRepository: Repository<UserImage>
     ){}

    async create(createUserDto: CreateUserDto) {

    try {

      const {images =[], password, ...userData} = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync( password, 10 ),
        images: images.map( image => this.userImageRepository.create({url: image}))
      });

      await this.userRepository.save(user)
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({id: user.id}),
        images
      };

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async validateUser(keyworDto: KeywordDto, id: string){
    const {keyword} = keyworDto;

    const user = await this.userRepository.findOne({
      where: {keyword, id},
      select: {email: true, id:true, fullName:true, Edad:true, Peso: true, Actividad:true,Objetivo:true,Altura:true,Nivel:true}
    });

    if (!user)
      throw new UnauthorizedException('Credenciales no validas')

    return{
      ...user,
      token: this.getJwtToken({id: user.id})
    
    }

  }

    

  async login(loginUserDto:LoginUserDto){
    const {password, email} = loginUserDto;

    const user = await this.userRepository.findOne({
      where: {email},
      select: {email: true, password: true, id:true, fullName:true, Edad:true, Peso: true, Actividad:true,Objetivo:true,Altura:true,Nivel:true} //OJO pedir el id!
    });

    if (!user)
      throw new UnauthorizedException('Credentials are not valid (email)');

    if(!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)');

    return {
      ...user,
      token: this.getJwtToken({id: user.id})
    };
  }

  async findOne(term:string){
    let user : User;

    if (isUUID(term)){
      user = await this.userRepository.findOneBy({id: term});
    } else {
      const queryBuilder = this.userRepository.createQueryBuilder('com');
      user = await queryBuilder
      .where('com.email = :email', {email: term})
      .leftJoinAndSelect('com.images', 'images')
      .getOne();
    }

    if(!user){
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOnePlain(id:string){
    const {images = [], ...rest} = await this.findOne(id);
    return {
      ...rest,
      images : images.map(images => images.url)
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const {images, password, ...toUpdate} = updateUserDto;

    const user = await this.userRepository.preload({id, ...toUpdate})
    
    if(!user) {
      throw new NotFoundException('User not found');
    }

    if(password){
      user.password = bcrypt.hashSync(password, 10);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if(images){
        await queryRunner.manager.delete(UserImage, {user: {id}});
        if(images.length > 0) {
          user.images = images.map(image => this.userImageRepository.create({url: image}))
        }
      }
    
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      
      delete user.password;
      return {
        ...user,
        token: this.getJwtToken({id: user.id}),
      };
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBErrors(error);
    }
    

  }
    
  async checkAuthStatus(user: User){
    return {
      ...user,
      token: this.getJwtToken({id: user.id})
    };
  }
  
  private getJwtToken(payload: JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleDBErrors(error: any): never {

    if(error.code === '23505'){
      throw new BadRequestException(error.detail);
    } 

    console.log(error)
    throw new InternalServerErrorException('please check server logs');

  }

}
