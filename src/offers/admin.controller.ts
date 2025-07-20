import { Controller, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OffersService } from './offers.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OfferDto } from './dto/offer.dto';

@ApiTags('admin/offers')
@ApiBearerAuth('Authorization')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/offers')
export class OffersAdminController {
    constructor(private readonly offers: OffersService) { }

    @ApiOperation({ summary: 'Créer une nouvelle offre' })
    @ApiResponse({ status: 201, description: 'Offre créée', type: OfferDto })
    @Post() create(@Body() dto: CreateOfferDto) {
        return this.offers.createOffer(dto);
    }


    @ApiOperation({ summary: 'Mettre à jour une offre' })
    @ApiParam({ name: 'id', description: 'ID de l’offre' })
    @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateOfferDto) {
        return this.offers.updateOffer(id, dto);
    }


    @ApiOperation({ summary: 'Supprimer une offre' })
    @ApiParam({ name: 'id', description: 'ID de l’offre' })
    @Delete(':id') remove(@Param('id') id: string) {
        return this.offers.removeOffer(id);
    }
}
