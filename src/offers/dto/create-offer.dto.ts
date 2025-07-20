import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsPositive, IsString, Min } from 'class-validator';

export class CreateOfferDto {
  @ApiProperty({ example: 'Forfait 10 Go' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ['voice', 'data', 'sms'] })
  @IsEnum(['voice', 'data', 'sms']) 
  category: string;

  @ApiProperty({ example: 5.99 })
  @IsPositive() 
  price: number;

  @ApiProperty({ example: 30 })
  @IsInt() @Min(1) 
  validityDays: number;

  @ApiProperty({ example: 'Mo' })
  @IsString() 
  quotaUnit: string;

  @ApiProperty({ example: 10_000 })
  @IsInt() @Min(1) 
  quotaAmount: number;
}
