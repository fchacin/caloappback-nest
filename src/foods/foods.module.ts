import { Module } from '@nestjs/common';
import { FoodsService } from './foods.service';
import { FoodsController } from './foods.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Food, FoodsImage } from './entities';

@Module({
  controllers: [FoodsController],
  providers: [FoodsService],
  imports: [
    TypeOrmModule.forFeature([Food,FoodsImage]),
  ],
})
export class FoodsModule {}
