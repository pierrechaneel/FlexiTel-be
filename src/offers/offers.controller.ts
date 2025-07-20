import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { OffersService } from './offers.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { CurrentUser } from 'src/auth/current-user-decorator';
import { TokenPayload } from 'src/auth/token-payload-interface';
import { SubscribeDto } from './dto/subscribe.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OfferDto } from './dto/offer.dto';

@ApiTags('offers')
@Controller('offers')
export class OffersController {
    constructor(private readonly offers: OffersService) { }

    @UseGuards(JwtAuthGuard)
     @ApiOperation({ summary: 'Lister toutes les offres actives' })
    @ApiResponse({ status: 200, description: 'Liste des offres', type: OfferDto, isArray: true })
    @Get()
    findAll() {
        return this.offers.findAllOffer();
    }



    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Souscrire à une offre' })
    @ApiParam({ name: 'id', description: 'ID de l’offre' })
    @ApiBody({ type: SubscribeDto })
    @ApiResponse({ status: 201, description: 'Souscription effectuée' })

    @Post(':id/subscribe')
    subscribe(
        @CurrentUser() user: TokenPayload,
        @Param('id') offerId: string,
        @Body() dto: SubscribeDto,
    ) {
        return this.offers.subscribeToOffer(user.userId, offerId, dto);
    }

}
