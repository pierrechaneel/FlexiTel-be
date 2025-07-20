// src/offers/offers-admin.controller.ts
import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';
import { OffersService } from 'src/offers/offers.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('admin/offers')
@ApiBearerAuth('Authorization')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/offers')
export class AdminController {
    constructor(private readonly offers: OffersService) { }

    @ApiQuery({ name: 'from', required: false, example: '2025-07-01' })
    @ApiQuery({ name: 'to', required: false, example: '2025-07-31' })
    @ApiQuery({ name: 'page', required: false, example: 2 })
    @ApiQuery({ name: 'limit', required: false, example: 25 })
    @Get('with-subscribers')
    listWithSubscribers(@Query() q: {
        category?: string;
        status?: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'ALL';
        from?: string;
        to?: string;
        page?: number;
        limit?: number;
    }) {
        return this.offers.listOffersWithSubscribers(q);
    }

}
