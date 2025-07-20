import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InvoicesService {
    constructor(private prisma: PrismaService) { }

    /** Liste paginée des factures de l’utilisateur */
    list(userId: string, page = 1, limit = 20, year?: number) {
        const take = Math.min(Math.max(limit, 5), 50);
        const where = {
            userId,
            ...(year ? { month: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } } : {}),
        };

        return this.prisma.invoice.findMany({
            where,
            orderBy: { month: 'desc' },
            skip: (page - 1) * take,
            take,
            include: {
                user: { select: { firstName: true, lastName: true, email: true } },
            }
        });
    }

    /** Détail d’une facture (JSON) */
    async getOne(userId: string, id: string) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id, userId },
        });
        if (!invoice) throw new NotFoundException('Facture introuvable');
        return invoice;
    }
}
