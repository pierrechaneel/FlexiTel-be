import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { OffersModule } from './offers/offers.module';
import { PhonesModule } from './phones/phones.module';



@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production'
        return {
          pinoHttp: {
            transport: isProduction
              ? undefined
              : {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                },
              },
            level: isProduction ? 'info' : 'debug',
          }
        }
      },
      inject: [ConfigService]
    }),
    ConfigModule.forRoot(),
    UsersModule,
    AuthModule,
    OffersModule,
    PhonesModule,],
  controllers: [],
  providers: [],
})
export class AppModule { }
