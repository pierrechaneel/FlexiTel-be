import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreatePhoneDto } from './dto/create-phone.dto';
import { PhonesService } from './phones.service';
import { UpdatePhoneStatusDto } from './dto/update-phone-status.dto';

@ApiTags('admin/phones')
@ApiBearerAuth('Authorization')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/phones')
export class PhonesAdminController {
    constructor(private readonly phones: PhonesService) { }

    @ApiOperation({ summary: 'Approvisionner le pool de numéros' })
    @ApiResponse({
        status: 201,
        description: 'Nombre de numéros créés',
        schema: { example: { count: 50 } },
    })
    @Post()
    create(@Body() dto: CreatePhoneDto | CreatePhoneDto[]) {
        const list = Array.isArray(dto) ? dto : [dto];
        return this.phones.createManyNumber(list);
    }



    @ApiOperation({ summary: 'Changer le statut d’un numéro' })
    @ApiParam({ name: 'id', description: 'ID du numéro' })
    @ApiResponse({ status: 200, description: 'Statut mis à jour' })
    @Patch(':id')
    updateStatus(@Param('id') id: string, @Body() dto: UpdatePhoneStatusDto) {
        return this.phones.updateStatus(id, dto);
    }



    @ApiOperation({ summary: 'Supprimer un numéro UNASSIGNED' })
    @ApiParam({ name: 'id', description: 'ID du numéro' })
    @ApiResponse({ status: 200, description: 'Numéro supprimé' })
    @ApiResponse({ status: 403, description: 'Numéro utilisé ou inexistant' })
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.phones.remove(id);
    }
}
