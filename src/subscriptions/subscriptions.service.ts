import {
    Injectable,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Logger } from 'nestjs-pino';


@Injectable()
export class SubscriptionsService {
    constructor(private prisma: PrismaService, private logger: Logger) { }

    listUserSubscriptions(userId: string) {
        return this.prisma.subscription.findMany({
            where: { phone: { userId } },
            include: { offer: true, phone: true },
            orderBy: { startDate: 'desc' },
        });
    }

    async getOne(userId: string, subId: string) {
        const sub = await this.prisma.subscription.findFirst({
            where: { id: subId, phone: { userId } },
            include: { offer: true, phone: true },
        });
        if (!sub) throw new NotFoundException('Abonnement introuvable');
        return sub;
    }

    /* --- CANCEL --*/
    async cancelSubscription(userId: string, subId: string,) {
        //  Récupération
        const sub = await this.prisma.subscription.findFirst({
            where: { id: subId, phone: { userId }, status: 'ACTIVE' },
            include: { offer: true },
        });
        if (!sub) throw new ForbiddenException('Abonnement non annulable');

        // Vérifier qu’il n'a jamais été utilisé
        if (sub.remaining !== sub.offer.quotaAmount) {
            throw new ForbiddenException('Abonnement déjà entamé - impossible de résilier');
        }

        const result = await this.prisma.$transaction(async (tx) => {
            // marquer la souscription annulée
            await tx.subscription.update({
                where: { id: subId },
                data: {
                    status: 'CANCELED',
                    remaining: 0,
                    endDate: new Date(),
                },
            });

            // remboursement
            const wallet = await tx.wallet.update({
                where: { userId },
                data: { balance: { increment: sub.offer.price } },
            });

            return wallet.balance;
        });

        this.logger.log(
            { userId, subId, refund: sub.offer.price },
            'Subscription canceled & refunded',
        );

        return {
            message: `Abonnement « ${sub.offer.name} » annulé et remboursé.`,
            refundAmount: Number(sub.offer.price),
            walletBalance: Number(result),
        };
    }


}
