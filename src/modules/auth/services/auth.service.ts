import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
    constructor() {}

    async signIn() {
        return "sign in";
    }
}