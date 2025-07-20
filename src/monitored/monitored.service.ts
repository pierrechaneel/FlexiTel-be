import {
  Injectable, ForbiddenException, ConflictException, NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddMonitoredDto } from './dto/add-monitored.dto';
import { UpdateAliasDto } from './dto/update-alias.dto';
import { Logger } from 'nestjs-pino';

@Injectable()
export class MonitoredService {
  constructor(private prisma: PrismaService, private log: Logger) {}

  /** Ajout d’un numéro à surveiller */
  async add(userId: string, dto: AddMonitoredDto) {
    //  le numéro existe‑t‑il et appartient‑il à un user ?
    const phone = await this.prisma.phoneNumber.findFirst({
      where: { msisdn: dto.msisdn, status: 'ACTIVE' },
    });
    if (!phone) throw new NotFoundException('Numéro inconnu ou inactif');

    //  déjà surveillé par qqun ?
    const exists = await this.prisma.monitoredNumber.findFirst({
      where: { msisdn: dto.msisdn },
    });
    if (exists) throw new ConflictException('Numéro déjà surveillé');

    // on enregistre
    const monitored = await this.prisma.monitoredNumber.create({
      data: { userId, msisdn: dto.msisdn, alias: dto.alias },
    });
    this.log.log({ userId, msisdn: dto.msisdn }, 'Monitored number added');
    return monitored;
  }

  /** Liste paginée */
  list(userId: string, page = 1, limit = 20) {
    const take = Math.min(Math.max(limit, 5), 50);
    return this.prisma.monitoredNumber.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * take,
      take,
    });
  }

  /** Changer l’alias */
  async updateAlias(userId: string, id: string, dto: UpdateAliasDto) {
    const m = await this.prisma.monitoredNumber.findUnique({ where: { id } });
    if (!m || m.userId !== userId)
      throw new ForbiddenException('Accès interdit');
    return this.prisma.monitoredNumber.update({
      where: { id },
      data: { alias: dto.alias },
    });
  }

  /** Suppression */
  async remove(userId: string, id: string) {
    const m = await this.prisma.monitoredNumber.findUnique({ where: { id } });
    if (!m || m.userId !== userId)
      throw new ForbiddenException('Accès interdit');
    return this.prisma.monitoredNumber.delete({ where: { id } });
  }
}
