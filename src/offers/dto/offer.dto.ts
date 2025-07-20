import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';

export class OfferDto {
  @ApiProperty({ example: '3af835aa‑b3c6‑4d66‑9f7d‑f07f3c9f6ab2' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Forfait 10 Go' })
  @Expose()
  name: string;

  @ApiProperty({ enum: ['voice', 'data', 'sms'], example: 'data' })
  @Expose()
  category: string;

  @ApiProperty({ example: 5.99, description: 'Prix en USD' })
  @Expose()
  @Transform(({ value }: { value: Decimal }) => Number(value))
  price: number;

  @ApiProperty({ example: 30, description: 'Durée de validité en jours' })
  @Expose()
  validityDays: number;

  @ApiProperty({ example: 'Mo' })
  @Expose()
  quotaUnit: string;

  @ApiProperty({ example: 10_000 })
  @Expose()
  quotaAmount: number;
}
