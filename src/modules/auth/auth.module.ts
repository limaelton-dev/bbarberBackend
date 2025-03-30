import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { config } from "dotenv";


@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>("APP_SECRET"),
            signOptions: { expiresIn: configService.get<string>("JWT_EXPIRATION_TIME") },
        }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
exports: [AuthService],
})
export class AuthModule {}