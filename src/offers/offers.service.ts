import {
    Injectable,
    ForbiddenException,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { addDays } from 'date-fns';
import { Logger } from 'nestjs-pino';
import { Prisma } from '@prisma/client';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { parseISO } from 'date-fns/parseISO';


@Injectable()
export class OffersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: Logger,
    ) { }

    /*  ADMIN */

    async createOffer(dto: CreateOfferDto) {
        try {
            const offer = await this.prisma.offer.create({ data: dto });
            this.logger.log({ id: offer.id }, 'Offer created');
            return offer;
        } catch (err) {
            if ((err as Prisma.PrismaClientKnownRequestError).code === 'P2002') {
                throw new ConflictException('Offer with same name already exists');
            }
            this.logger.error(err, 'Failed to create offer');
            throw err;
        }
    }

    async updateOffer(id: string, dto: UpdateOfferDto) {
        try {
            const offer = await this.prisma.offer.update({
                where: { id },
                data: dto,
            });
            this.logger.log({ id }, 'Offer updated');
            return offer;
        } catch (err) {
            if (this.isNotFound(err)) throw new NotFoundException('Offer not found');
            this.logger.error(err, 'Failed to update offer');
            throw err;
        }
    }

    async removeOffer(id: string) {
        try {
            await this.prisma.offer.delete({ where: { id } });
            this.logger.log({ id }, 'Offer deleted');
        } catch (err) {
            if (this.isNotFound(err)) throw new NotFoundException('Offer not found');
            this.logger.error(err, 'Failed to delete offer');
            throw err;
        }
    }

    async listOffersWithSubscribers(
        params: {
            category?: string;
            status?: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'ALL';
            from?: string;
            to?: string;
            page?: number;
            limit?: number;
        },
    ) {
        const {
            category,
            status = 'ACTIVE',
            from,
            to,
            page = 1,
            limit = 50,
        } = params;

       
        const subWhere: Prisma.SubscriptionWhereInput = {
            ...(status !== 'ALL' ? { status } : {}),
            ...(from ? { startDate: { gte: parseISO(from) } } : {}),
            ...(to ? { startDate: { lte: parseISO(to) } } : {}),
        };

       
        const take = Math.min(Math.max(limit, 10), 100);   
        const skip = (page - 1) * take;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.offer.findMany({
                where: category ? { category } : undefined,
                orderBy: { price: 'asc' },
                skip,
                take,
                include: {
                    subscriptions: {
                        where: subWhere,
                        select: {
                            startDate: true,
                            status: true,
                            phone: {
                                select: {
                                    msisdn: true,
                                    user: {
                                        select: {
                                            firstName: true,
                                            lastName: true,
                                            email: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            subscriptions: { where: subWhere },
                        },
                    },
                },
            }),
            this.prisma.offer.count({
                where: category ? { category } : undefined,
            }),
        ]);

        return {
            meta: {
                page,
                limit: take,
                total,
                pages: Math.ceil(total / take),
            },
            items,
        };
    }



    //  PUBLIC 

    async findAllOffer() {
        return this.prisma.offer.findMany({ orderBy: { price: 'asc' } });
    }

    //USER : souscription*/
    async subscribeToOffer(
        userId: string,
        offerId: string,
        dto: SubscribeDto,
    ) {
        try {
            /* Vérifs préalables */
            const [wallet, offer, phone] = await Promise.all([
                this.prisma.wallet.findUnique({ where: { userId } }),
                this.prisma.offer.findUnique({ where: { id: offerId } }),
                this.prisma.phoneNumber.findUnique({ where: { id: dto.phoneId } }),
            ]);
            console.log('balance:', wallet?.balance)
            console.log('prix:', offer?.price)
            if (!offer) throw new NotFoundException('Offre introuvable');
            if (!wallet || (Number(wallet.balance) < Number(offer.price)))
                throw new ForbiddenException('Solde insuffisant');
            if (!phone || phone.userId !== userId)
                throw new ForbiddenException('Numéro non autorisé');

            // Empêche une double souscription active
            const activeCount = await this.prisma.subscription.count({
                where: {
                    phoneId: dto.phoneId,
                    offerId,
                    status: 'ACTIVE',
                },
            });
            if (activeCount)
                throw new ConflictException(
                    'Souscription déjà active pour ce numéro',
                );

            /*  Transaction */
            const { updatedWallet, subscription } =
                await this.prisma.$transaction(async (tx) => {
                    const updatedWallet = await tx.wallet.update({
                        where: { id: wallet.id },
                        data: { balance: { decrement: offer.price } },
                    });

                    // Création de la souscription
                    const subscription = await tx.subscription.create({
                        data: {
                            phoneId: dto.phoneId,
                            offerId,
                            startDate: new Date(),
                            endDate: addDays(new Date(), offer.validityDays),
                            remaining: offer.quotaAmount,
                            status: 'ACTIVE',
                        },
                        include: { offer: true },
                    });

                    //Facture liée
                    await tx.invoice.create({
                        data: {
                            userId,
                            amount: offer.price,
                            month: new Date(),
                            subscriptionId: subscription.id,
                        },
                    });

                    return { updatedWallet, subscription };
                });

            this.logger.log(
                { userId, offerId, subscriptionId: subscription.id },
                'Souscription réussie',
            );

            return {
                message: `Souscription confirmée ! Nouveau solde : ${updatedWallet.balance.toFixed(2)} $`,
                subscription: {
                    id: subscription.id,
                    phoneId: subscription.phoneId,
                    offer: subscription.offer.name,
                    startDate: subscription.startDate,
                    endDate: subscription.endDate,
                    remaining: subscription.remaining,
                },
                walletBalance: Number(updatedWallet.balance),
            };
        } catch (err) {
            this.logger.error(
                { userId, offerId, err },
                'Échec de la souscription',
            );
            throw err;
        }
    }

    //  Helpers 
    private isNotFound(err: unknown) {
        return (
            (err as Prisma.PrismaClientKnownRequestError).code === 'P2025' ||
            err instanceof NotFoundException
        );
    }
}
