import {
  Controller, Post, Body, UseGuards, Get, Query,
  Patch, Param, Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { CurrentUser } from 'src/auth/current-user-decorator';
import { TokenPayload } from 'src/auth/token-payload-interface';
import { MonitoredService } from './monitored.service';
import { AddMonitoredDto } from './dto/add-monitored.dto';
import { UpdateAliasDto } from './dto/update-alias.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('monitored')
@ApiBearerAuth('Authorization')
@UseGuards(JwtAuthGuard)
@Controller('monitored')
export class MonitoredController {
  constructor(private readonly service: MonitoredService) {}

  @ApiOperation({ summary: 'Ajouter un numéro à surveiller' })
  @Post()
  add(@CurrentUser() u: TokenPayload, @Body() dto: AddMonitoredDto) {
    return this.service.add(u.userId, dto);
  }

  @ApiOperation({ summary: 'Lister mes numéros surveillés' })
  @Get()
  list(
    @CurrentUser() u: TokenPayload,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.service.list(u.userId, Number(page), Number(limit));
  }

  @ApiOperation({ summary: 'Mettre à jour l’alias' })
  @Patch(':id')
  update(
    @CurrentUser() u: TokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAliasDto,
  ) {
    return this.service.updateAlias(u.userId, id, dto);
  }

  @ApiOperation({ summary: 'Supprimer un numéro surveillé' })
  @Delete(':id')
  remove(@CurrentUser() u: TokenPayload, @Param('id') id: string) {
    return this.service.remove(u.userId, id);
  }
}
