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

@Injectable()
export class OffersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,    
  ) {}

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

 
  //  PUBLIC 
  
  async findAllOffer() {
    return this.prisma.offer.findMany({ orderBy: { price: 'asc' } });
  }

 //USER : souscription*/
 
  async subscribeToOffer(userId: string, offerId: string, dto: SubscribeDto) {
    try {
      const [wallet, offer] = await Promise.all([
        this.prisma.wallet.findUnique({ where: { userId } }),
        this.prisma.offer.findUnique({ where: { id: offerId } }),
      ]);

      if (!offer) throw new NotFoundException('Offer not found');
      if (!wallet || wallet.balance < offer.price)
        throw new ForbiddenException('Solde insuffisant');

      await this.prisma.$transaction([
        this.prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: offer.price } },
        }),
        this.prisma.subscription.create({
          data: {
            phoneId: dto.phoneId,
            offerId,
            startDate: new Date(),
            endDate: addDays(new Date(), offer.validityDays),
            remaining: offer.quotaAmount,
          },
        }),
        this.prisma.invoice.create({
          data: {
            userId,
            amount: offer.price,
            month: new Date(),
          },
        }),
      ]);

      this.logger.log(
        { userId, offerId },
        'User subscribed successfully to offer',
      );
    } catch (err) {
      this.logger.error(
        { userId, offerId, err },
        'Subscription transaction failed',
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
