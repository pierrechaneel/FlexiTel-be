import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt'
import { SignupDto } from 'src/users/dto/signup.dto';



type PublicUser = {
    id: string;
    email: string;
    firstName: string | null;
};

@Injectable()
export class UsersService {

    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async getUser(filter: Prisma.UserWhereInput) {
        return this.prismaService.user.findFirstOrThrow({
            where: filter,
        })
    }

    async signup(data: SignupDto): Promise<PublicUser> {
        try {
            return await this.prismaService.user.create({
                data: {
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    passwordHash: await bcrypt.hash(data.password, 12),
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                },
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new UnprocessableEntityException('Email already exist.')
            }
            throw error;
        }

    }
}
