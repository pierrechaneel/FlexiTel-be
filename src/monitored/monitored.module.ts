import { Module } from '@nestjs/common';
import { MonitoredService } from './monitored.service';
import { MonitoredController } from './monitored.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MonitoredService],
  controllers: [MonitoredController]
})
export class MonitoredModule {}
