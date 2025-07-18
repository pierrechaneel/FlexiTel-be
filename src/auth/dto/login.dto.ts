import { IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'pierrotasimwe@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6, example: '12345' })
  @MinLength(6)
  password: string;
}
