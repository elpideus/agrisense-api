import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { FieldsModule } from './fields/fields.module';
import { CropsModule } from './crops/crops.module';
import { DevicesModule } from './devices/devices.module';
import { ReportsModule } from './reports/reports.module';
import { HarvestsModule } from './harvests/harvests.module';

/**
 * The root module of the application.
 * Imports all resource modules and configures the base application.
 */
@Module({
  imports: [PrismaModule, UsersModule, FieldsModule, CropsModule, DevicesModule, ReportsModule, HarvestsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
