// src/auth/dto/signup.dto.ts
import { IsEmail, IsStrongPassword, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'pierrotasimwe@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6, example: '12345' })
  @MinLength(6)
  @IsStrongPassword()
  password: string;

  @ApiProperty({ required: false, example: 'piero' })
  firstName?: string;

  @ApiProperty({ required: false, example: 'Asimwe' })
  lastName?: string;
}
