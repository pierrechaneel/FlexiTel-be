import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Logger } from 'nestjs-pino';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { CurrentUser } from 'src/auth/current-user-decorator';
import { TokenPayload } from 'src/auth/token-payload-interface';
import { SignupDto } from 'src/users/dto/signup.dto';


@ApiTags('users')
@Controller('users')
export class UsersController {

    constructor(
        private readonly userService: UsersService,
        private readonly logger: Logger,
    ) { }

    @Post()
    @UseInterceptors(NoFilesInterceptor())
    @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
    @ApiResponse({ status: 201, description: 'Utilisateur créé.' })
    async createUser(@Body() dto: SignupDto) {
        this.logger.debug({ body: dto }, 'UsersController.createUser');
        const user = await this.userService.signup(dto);
        this.logger.log({ userId: user.id }, 'User created');
        return user;
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('Authorization')
    @ApiOperation({ summary: 'Récupérer les informations du user courant' })
    @ApiResponse({ status: 200, description: 'Détails du user.' })
    async getMe(@CurrentUser() user: TokenPayload) {
        this.logger.debug({ userId: user.userId }, 'UsersController.getMe');
        return user;
    }
}
