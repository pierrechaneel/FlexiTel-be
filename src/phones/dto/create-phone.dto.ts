import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePhoneDto {
  @ApiProperty({ example: '243970000123' })
  @IsString()
  msisdn: string;

  @ApiProperty({ example: '6300100000123' })
  @IsString()
  imsi: string;
}
