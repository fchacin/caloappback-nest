import { Module } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './entities/exercise.entity';
import { ExcercisesImage } from './entities/exercise-image.entity';

@Module({
  controllers: [ExercisesController],
  providers: [ExercisesService],
  imports: [
    TypeOrmModule.forFeature([Exercise,ExcercisesImage])
  ],
})
export class ExercisesModule {}
