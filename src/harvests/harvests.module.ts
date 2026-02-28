import { Module } from '@nestjs/common';
import { HarvestsController } from './harvests.controller';
import { HarvestsService } from './harvests.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Module responsible for crop harvests.
 */
@Module({
  imports: [PrismaModule],
  controllers: [HarvestsController],
  providers: [HarvestsService],
  exports: [HarvestsService],
})
export class HarvestsModule { }
