import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { SignInDto } from "../dto/sign.in.dto";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async signIn(@Body() signInDto: SignInDto) {
        return this.authService.signIn();
    }

    // @Post('signup')
    // @HttpCode(HttpStatus.CREATED)
    // @UsePipes(new ValidationPipe({ transform: true, whitelist: true}))
    // async signUp(@Body() createUserDto: CreateUserDto) {
    //     return this.authService.signUp();
    // }

}