import {
    Controller,
    Get,
    Post,
    Param,
    UseGuards,
    Delete,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user-decorator';
import { PhonesService } from './phones.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { TokenPayload } from 'src/auth/token-payload-interface';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('phones')
@ApiBearerAuth('Authorization')
@UseGuards(JwtAuthGuard)
@Controller('phones')
export class PhonesController {
    constructor(private readonly phones: PhonesService) { }

    @ApiOperation({ summary: 'Lister les numéros disponibles' })
    @ApiResponse({ status: 200, description: 'Liste des numéros disponibles' })
    @ApiResponse({ status: 401, description: 'JWT manquant ou invalide' })
    @ApiResponse({ status: 403, description: 'Accès refusé' })
    @Get('available')
    list() {
        return this.phones.findAvailableNumber();
    }


    @ApiOperation({ summary: 'Réserver un numéro et recevoir 50 $' })
    @ApiParam({ name: 'id', description: 'ID du numéro' })
    @ApiResponse({
        status: 201,
        description: 'Numéro réservé, bonus crédité',
        schema: { example: { phoneId: '...', bonus: 50 } },
    })
    @ApiResponse({ status: 403, description: 'Numéro indisponible' })
    @Post(':id/claim')
    claim(
        @CurrentUser() user: TokenPayload,
        @Param('id') phoneId: string,
    ) {
        return this.phones.claimNumber(user.userId, phoneId);
    }


    
    @ApiOperation({ summary: 'Abandonner / libérer son numéro' })
    @ApiParam({ name: 'id', description: 'ID du numéro' })
    @ApiResponse({
        status: 200,
        description: 'Numéro libéré',
        schema: { example: { phoneId: '...', status: 'UNASSIGNED' } },
    })
    @ApiResponse({ status: 403, description: 'Numéro non lié ou abonnement actif' })
    @Delete(':id/release')
    release(
        @CurrentUser() user: TokenPayload,
        @Param('id') phoneId: string,
    ) {
        return this.phones.release(user.userId, phoneId);
    }
}
