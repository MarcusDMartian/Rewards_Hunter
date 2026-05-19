// ============================================
// AUTH DTOs
// ============================================

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&^#_\-+=.,:;()[\]{}|/\\<>~`'"]{8,72}$/;

const PASSWORD_MESSAGE =
  'Password must be 8-72 chars and include uppercase, lowercase, and a number';

export class CheckDomainDto {
  @IsEmail()
  @MaxLength(254)
  email: string;
}

export class SendOtpDto {
  @IsEmail()
  @MaxLength(254)
  email: string;
}

export class LoginDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password: string;
}

export class RegisterOrgDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @Matches(STRONG_PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 60)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 60)
  orgName: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}

export class JoinRequestDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @Matches(STRONG_PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 60)
  name: string;

  @IsString()
  @IsNotEmpty()
  orgId: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class VerifyForgotOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
