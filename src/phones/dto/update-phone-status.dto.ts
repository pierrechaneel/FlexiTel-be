import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PhoneStatus } from '@prisma/client';

export class UpdatePhoneStatusDto {
  @ApiProperty({ enum: PhoneStatus, example: 'SUSPENDED' })
  @IsEnum(PhoneStatus)
  status: PhoneStatus;
}
