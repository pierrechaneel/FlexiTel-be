import { Module } from '@nestjs/common';
import { PhonesService } from './phones.service';
import { PhonesController } from './phones.controller';
import { PhonesAdminController } from './admin.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PhonesService],
  controllers: [PhonesController, PhonesAdminController]
})
export class PhonesModule {}
