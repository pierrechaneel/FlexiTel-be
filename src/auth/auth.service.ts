import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from "bcrypt"
import { Prisma, User } from '@prisma/client';
import { Response } from 'express';
import * as ms from 'ms';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './token-payload-interface';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from '../users/dto/signup.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) { }

    async login(user: User, response: Response) {
        const expires = new Date();
        expires.setTime(
            expires.getTime() +
            (ms as any)(this.configService.getOrThrow<string>('JWT_EXPIRATION'))
        );

        const TokenPayload: TokenPayload = {
            userId: user.id,
        };
        const token = this.jwtService.sign(TokenPayload);
        response.cookie('Authentication', token, {
            secure: true,
            httpOnly: true,
            expires
        });
        return { TokenPayload }
    }

    async verifyUser(email: string, passpword: string) {
        try {
            const user = await this.userService.getUser({ email });
            const authenticated = await bcrypt.compare(passpword, user.passwordHash);
            if (!authenticated) {
                throw new UnauthorizedException();
            }
            return user;
        } catch (error) {
            throw new UnauthorizedException('Credentials are not valid.');
        }
    }

    logout(res: Response): { message: string } {
        res.clearCookie('Authentication', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        return { message: 'Logged out successfully' };
    }

}
