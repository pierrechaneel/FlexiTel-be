import { IsEmail, IsNotEmpty, IsStrongPassword, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'pierrotasimwe@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6, example: '12345' })
  @MinLength(6)
  @IsStrongPassword()
  password: string;

  @IsNotEmpty()
  @ApiProperty({ required: true, example: 'piero' })
  firstName?: string;

  @IsNotEmpty()
  @ApiProperty({ required: true, example: 'Asimwe' })
  lastName?: string;
}
