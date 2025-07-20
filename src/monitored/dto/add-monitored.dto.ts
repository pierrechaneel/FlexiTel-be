import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMonitoredDto {
  @ApiProperty({ example: '243971234567' })
  @IsString() @IsNotEmpty() msisdn: string;

  @ApiProperty({ example: 'Téléphone de Junior', required: false })
  @IsString() @IsOptional() @Length(1, 50) alias?: string;
}