import {
    Injectable,
    ForbiddenException,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Logger } from 'nestjs-pino';
import { CreatePhoneDto } from './dto/create-phone.dto';
import { Prisma } from '@prisma/client';
import { UpdatePhoneStatusDto } from './dto/update-phone-status.dto';

@Injectable()
export class PhonesService {
    constructor(private prisma: PrismaService, private logger: Logger) { }

    // ADMIN
    async createManyNumber(list: CreatePhoneDto[]) {
        try {
            const result = await this.prisma.phoneNumber.createMany({ data: list });
            this.logger.log({ count: result.count }, 'Phones seeded');
            return result;
        } catch (err) {
            if ((err as Prisma.PrismaClientKnownRequestError).code === 'P2002') {
                throw new ConflictException('Duplicate MSISDN or IMSI');
            }
            throw err;
        }
    }

    async updateStatus(id: string, dto: UpdatePhoneStatusDto) {
        return this.prisma.phoneNumber.update({
            where: { id },
            data: { status: dto.status },
        });
    }

    async remove(id: string) {
        const phone = await this.prisma.phoneNumber.findUnique({ where: { id } });
        if (!phone || phone.status !== 'UNASSIGNED')
            throw new ForbiddenException('Numéro utilisé ou inexistant');
        return this.prisma.phoneNumber.delete({ where: { id } });
    }

    // USER

    findAvailableNumber() {
        return this.prisma.phoneNumber.findMany({
            where: { status: 'UNASSIGNED' },
            select: { id: true, msisdn: true },
            orderBy: { msisdn: 'asc' },
        });
    }

    async claimNumber(userId: string, phoneId: string) {
        return this.prisma.$transaction(async (tx) => {
            const phone = await tx.phoneNumber.findFirst({
                where: { id: phoneId, status: 'UNASSIGNED' },
            });
            if (!phone) throw new ForbiddenException('Numéro indisponible');

            // assignation
            await tx.phoneNumber.update({
                where: { id: phoneId },
                data: { userId, status: 'ACTIVE' },
            });

            const user = await tx.user.findUnique({ where: { id: userId } });

            let bonus = 0;
            if (user?.isNew) {
                bonus = 50;
                await Promise.all([
                    tx.wallet.update({
                        where: { userId },
                        data: { balance: { increment: bonus } },
                    }),
                    tx.user.update({
                        where: { id: userId },
                        data: { isNew: false, topUpCumulative: { increment: bonus } },
                    }),
                ]);
            }

            this.logger.log({ userId, phoneId, bonus }, 'Phone claimed');
            return { phoneId, bonus };
        });
    }


    async release(userId: string, phoneId: string) {
        const phone = await this.prisma.phoneNumber.findUnique({ where: { id: phoneId } });
        if (!phone || phone.userId !== userId)
            throw new ForbiddenException('Numéro non attribué à cet utilisateur');

        // Vérifier qu'il n'y a pas d'abonnements actifs
        const activeSubs = await this.prisma.subscription.count({
            where: { phoneId, status: 'ACTIVE' },
        });
        if (activeSubs > 0)
            throw new ForbiddenException(`Abonnement actif, résiliez-le d'abord`);

        return this.prisma.phoneNumber.update({
            where: { id: phoneId },
            data: { status: 'UNASSIGNED', userId: null },
        });
    }

    async findByUser(userId: string) {
        return this.prisma.phoneNumber.findMany({
            where: { userId },
            select: {
                id: true,
                msisdn: true,
                imsi: true,
                status: true,
            },
            orderBy: { msisdn: 'asc' },
        });
    }
}
