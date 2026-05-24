// ============================================
// AUTH MODULE
// ============================================

import { Module } from '@nestjs/common';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    GamificationModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const isProd = configService.get<string>('NODE_ENV') === 'production';
        if (!secret || secret.length < 32) {
          if (isProd) {
            throw new Error(
              'JWT_SECRET must be set and at least 32 chars in production',
            );
          }

          console.warn(
            '[AuthModule] Using weak dev JWT secret. Set JWT_SECRET to a strong value.',
          );
        }
        const expiresIn = (configService.get<string>('JWT_EXPIRES_IN') ||
          '24h') as JwtSignOptions['expiresIn'];
        return {
          secret: secret || 'dev-only-secret-do-not-use-in-prod',
          signOptions: { expiresIn },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
