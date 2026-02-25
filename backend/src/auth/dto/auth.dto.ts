// ============================================
// AUTH DTOs
// ============================================

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CheckDomainDto {
    @IsEmail()
    email: string;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class RegisterOrgDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    orgName: string;
}

export class JoinRequestDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    orgId: string;
}
