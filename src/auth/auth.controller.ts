import { Controller, Post, UseGuards, Res, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { LocalGuard } from './strategies/local-auth-guard';
import { CurrentUser } from './current-user-decorator';
import { User } from '@prisma/client';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { LoginDto } from './dto/login.dto';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private readonly logger: Logger,
    ) { }



    @UseGuards(LocalGuard)
    @Post('login')
    @ApiOperation({ summary: 'Connexion (login)' })
    @ApiResponse({ status: 200, description: 'Cookie JWT défini.' })
    async login(
        @CurrentUser() user: User,                       
        @Res({ passthrough: true }) response: Response,
    ) {
        this.logger.debug({ userId: user.id }, 'AuthController.login');
        const result = await this.authService.login(user, response);
        this.logger.log({ userId: user.id }, 'AuthController.login success');
        return result;
    }



    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @ApiBearerAuth('Authorization')
    @ApiOperation({ summary: 'Déconnexion (logout)' })
    @ApiResponse({ status: 200, description: 'Cookie supprimé.' })
    logout(@Res({ passthrough: true }) res: Response) {
        this.logger.log('AuthController.logout');
        return this.authService.logout(res);
    }
}
