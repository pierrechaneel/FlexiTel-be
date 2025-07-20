import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAliasDto {
  @ApiProperty({ example: 'Nouveau surnom' })
  @IsString() @Length(1, 50) alias: string;
}