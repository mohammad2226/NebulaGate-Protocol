import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyModule } from './policy/policy.module';
import { EligibilityModule } from './eligibility/eligibility.module';
import { AccessModule } from './access/access.module';
import { JwtModule } from './jwt/jwt.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({
        type: 'postgres',
        host: cs.get('DB_HOST', 'localhost'),
        port: cs.get('DB_PORT', 5432),
        username: cs.get('DB_USERNAME', 'postgres'),
        password: cs.get('DB_PASSWORD', 'postgres'),
        database: cs.get('DB_DATABASE', 'nebulagate'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    JwtModule, PolicyModule, EligibilityModule, AccessModule,
  ],
})
export class AppModule {}