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
      const result = await this.prismaService.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            passwordHash: await bcrypt.hash(data.password, 12),
          },
        });

        await tx.wallet.create({
          data: { userId: user.id, balance: 0 },
        });

        return user;
      });

      console.log({ userId: result.id }, 'User & wallet created');
      return {
        id: result.id,
        email: result.email,
        firstName: result.firstName,
      };
    } catch (err) {
      if (
        (err as Prisma.PrismaClientKnownRequestError).code === 'P2002'
      ) {
        throw new UnprocessableEntityException(
          'Adresse e-mail déjà utilisée',
        );
      }
      throw err;
    }
  }
}
