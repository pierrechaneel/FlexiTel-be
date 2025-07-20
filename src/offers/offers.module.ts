import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { OffersAdminController } from './admin.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
   imports: [PrismaModule],
  providers: [OffersService],
  controllers: [OffersController, OffersAdminController]
})
export class OffersModule {}
