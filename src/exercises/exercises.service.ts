
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import {Exercise} from './entities/exercise.entity';
import { DataSource, Repository } from 'typeorm';
import { ExcercisesImage } from './entities/exercise-image.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import{ validate as isUUID } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';

@Injectable()
export class ExercisesService {

  private readonly logger = new Logger('ExercisesService');

  constructor(
    @InjectRepository(Exercise)
    private readonly excerciseRepository: Repository<Exercise>,

    @InjectRepository(ExcercisesImage)
    private readonly exerciseImageRepository: Repository<ExcercisesImage>,

    private readonly dataSource: DataSource,

  ) {}


  async create(createExerciseDto: CreateExerciseDto) {
    
    try {

      const {images = [], ...exerciseDetails } = createExerciseDto;

      const exercise = this.excerciseRepository.create({
        ...exerciseDetails,
        images: images.map( image => this.exerciseImageRepository.create({url: image}))
      })

      await this.excerciseRepository.save(exercise);

      return {...exercise, images};

    } catch (error) {

      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit =10, offset=0 } = paginationDto;
    const exercises = await this.excerciseRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });

    return exercises.map(exercise => ({
      ...exercise,
      images: exercise.images.map(image => image.url)
    }));

  }

  async findOne(term: string) {
    
    let exercise : Exercise;

    if (isUUID(term)) {
      exercise = await this.excerciseRepository.findOneBy({id: term});
    } else {
      const queryBuilder = this.excerciseRepository.createQueryBuilder('com');
      exercise = await queryBuilder
      .where('(LOWER(title) =:title) ', {
        title: term.toLowerCase()
      })
      .leftJoinAndSelect('com.images', 'images')
      .getOne();
    }

    if (!exercise) {
      throw new NotFoundException('Food not found');
    }
    return exercise;
  }

  async findOnePlain(id:string){
    const {images=[], ...rest} = await this.findOne(id);
    return{
      ...rest,
      images: images.map(images => images.url)

    }
  }

  async update(id: string, updateExerciseDto: UpdateExerciseDto) {
    const {images, ...toUpdate} = updateExerciseDto;

    const exercise = await this.excerciseRepository.preload({id,...toUpdate});

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        if (images) {
          await queryRunner.manager.delete(ExcercisesImage, {exercise:{id}});
          exercise.images = images.map( image => this.exerciseImageRepository.create({url: image}));
        }

        await queryRunner.manager.save(exercise);

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
    const exercise = await this.findOne(id);
    await this.excerciseRepository.remove(exercise);
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
    const query = this.excerciseRepository.createQueryBuilder('exercise');

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
