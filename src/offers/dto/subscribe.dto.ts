import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SubscribeDto {
  @ApiProperty({
    description: `ID du numéro (phoneId) que l’utilisateur veut utiliser`,
    example: 'f51cc6bd-d52a-4e09-81e7-338a5fb5963d',
  })
  @IsUUID()
  phoneId!: string;
}
