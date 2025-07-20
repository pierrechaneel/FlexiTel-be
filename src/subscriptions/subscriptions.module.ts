import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AdminController } from './admin.controller';
import { UserSubscriptionsController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OffersService } from 'src/offers/offers.service';

@Module({
  imports: [PrismaModule],
  providers: [SubscriptionsService,OffersService],
  controllers: [AdminController, UserSubscriptionsController]
})
export class SubscriptionsModule {}
