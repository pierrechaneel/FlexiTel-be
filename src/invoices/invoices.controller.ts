import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { CurrentUser } from 'src/auth/current-user-decorator';
import { TokenPayload } from 'src/auth/token-payload-interface';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('invoices')
@ApiBearerAuth('Authorization')
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private svc: InvoicesService) {}

  @ApiOperation({ summary: 'Lister mes factures' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @Get()
  list(
    @CurrentUser() me: TokenPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('year') year?: number,
  ) {
    return this.svc.list(me.userId, Number(page), Number(limit), Number(year));
  }

  @ApiOperation({ summary: `Détail d'une facture` })
  @ApiParam({ name: 'id', description: 'ID de la facture' })
  @Get(':id')
  getOne(@CurrentUser() me: TokenPayload, @Param('id') id: string) {
    return this.svc.getOne(me.userId, id);
  }
}
