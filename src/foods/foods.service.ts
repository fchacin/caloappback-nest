import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Food } from './entities/food.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import{ validate as isUUID } from 'uuid';
import { FoodsImage } from './entities';
/* import {title}  from 'process'; */

@Injectable()
export class FoodsService {

  private readonly logger = new Logger('FoodsService');

  constructor(
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,

    @InjectRepository(FoodsImage)
    private readonly foodImageRepository: Repository<FoodsImage>,

    private readonly dataSource: DataSource,

  ) {}

  async create(createFoodDto: CreateFoodDto) {
    
    try {

      const {images = [], ...foodDetails } = createFoodDto;

      const food = this.foodRepository.create({
        ...foodDetails,
        images: images.map( image => this.foodImageRepository.create({url: image}))
      });

      await this.foodRepository.save(food);

      return {...food, images};
      
    } catch (error) {
      this.handleDBExceptions(error);
       
    }
  }

  async findAll(paginationDto: PaginationDto) {

    const { limit =10, offset=0 } = paginationDto;
    const foods = await this.foodRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });

    return foods.map(food => ({
      ...food,
      images: food.images.map(image => image.url)
    }))
  }

  async findOne(term: string) {
    let food: Food;

    if (isUUID(term)) {
      food = await this.foodRepository.findOneBy({id: term});
    } else{

      const queryBuilder = this.foodRepository.createQueryBuilder('com');
      food = await queryBuilder
        .where ('(LOWER(title) =:title) ', {
         title: term.toLowerCase()
        })
        .leftJoinAndSelect('com.images', 'images')
        .getOne();

    }

    if (!food) {
      throw new NotFoundException('Food not found');
    }

    return food;
  }

  async findOnePlain(id:string){
    const {images=[], ...rest} = await this.findOne(id);
    return{
      ...rest,
      images: images.map(images => images.url)

    }
  }

  async update(id: string, updateFoodDto: UpdateFoodDto) {

    const {images, ...toUpdate} = updateFoodDto;

    const food = await this.foodRepository.preload({id,...toUpdate});

    if (!food) throw new NotFoundException(`Product with id: ${ id } not found`);
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();


    try {

      if (images) {
        await queryRunner.manager.delete(FoodsImage, {  food: {id}});
        food.images = images.map(image => this.foodImageRepository.create({url: image}));
      }
      await queryRunner.manager.save(food);


      /* await this.foodRepository.save(food); */
      
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return this.findOnePlain(id);


    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
    
  }

  async remove(id: string) {

    const food = await this.findOne(id);
    await this.foodRepository.remove(food);
  }


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleDBExceptions( error: any ) {

    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);
    
    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');

  }

  async deleteAllProducts(){
    const query = this.foodRepository.createQueryBuilder('food');

    try {
        return await query
        .delete()
        .where({})
        .execute();
        
    } catch (error) {
        this.handleDBExceptions(error);
    }
  }
}
