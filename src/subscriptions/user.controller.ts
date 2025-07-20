import {
  Controller,
  Get,
  Param,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { CurrentUser } from 'src/auth/current-user-decorator';
import { TokenPayload } from 'src/auth/token-payload-interface';
import { SubscriptionsService } from './subscriptions.service';


@ApiTags('subscriptions')
@ApiBearerAuth('Authorization')
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class UserSubscriptionsController {
  constructor(private readonly subs: SubscriptionsService) {}


  @ApiOperation({ summary: 'Lister mes abonnements' })
  @ApiResponse({ status: 200, description: 'Liste retournée' })
  @Get()
  list(@CurrentUser() user: TokenPayload) {
    return this.subs.listUserSubscriptions(user.userId);
  }

 
  @ApiOperation({ summary: `'Détail d'un abonnement'` })
  @ApiParam({ name: 'id', description: `ID de l'abonnement` })
  @Get(':id')
  getOne(@CurrentUser() user: TokenPayload, @Param('id') id: string) {
    return this.subs.getOne(user.userId, id);
  }

 
  @ApiOperation({ summary: 'Résilier un abonnement actif' })
  @ApiParam({ name: 'id', description: `ID de l'abonnement`})
  @Delete(':id')
  cancel(
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
  ) {
    return this.subs.cancelSubscription(user.userId, id);
  }
}
